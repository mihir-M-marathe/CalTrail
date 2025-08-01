const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize, authorizeNutritionistAccess } = require('../middlewares/auth');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// @route   GET /api/users
// @desc    Get all users (nutritionist/admin only)
// @access  Private (Nutritionist/Admin)
router.get('/', authorize('NUTRITIONIST', 'ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // If nutritionist, only show their assigned users
    if (req.user.role === 'NUTRITIONIST') {
      where.OR = [
        { assignedNutritionistId: req.user.id },
        { id: req.user.id } // Include themselves
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          assignedNutritionistId: true,
          assignedNutritionist: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Own data or authorized nutritionist/admin)
router.get('/:id', authorizeNutritionistAccess, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        dateOfBirth: true,
        height: true,
        weight: true,
        gender: true,
        activityLevel: true,
        goals: true,
        assignedNutritionistId: true,
        createdAt: true,
        assignedNutritionist: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/:id/assign-nutritionist
// @desc    Assign nutritionist to user
// @access  Private (Admin only)
router.put('/:id/assign-nutritionist', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nutritionistId } = req.body;

    // Verify nutritionist exists and has correct role
    if (nutritionistId) {
      const nutritionist = await prisma.user.findUnique({
        where: { 
          id: nutritionistId,
          role: 'NUTRITIONIST'
        }
      });

      if (!nutritionist) {
        return res.status(400).json({
          success: false,
          error: 'Invalid nutritionist ID'
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { assignedNutritionistId: nutritionistId || null },
      select: {
        id: true,
        name: true,
        email: true,
        assignedNutritionistId: true,
        assignedNutritionist: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id/nutrition-summary
// @desc    Get user's nutrition summary
// @access  Private (Own data or authorized nutritionist/admin)
router.get('/:id/nutrition-summary', authorizeNutritionistAccess, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const mealEntries = await prisma.mealEntry.findMany({
      where: {
        userId: parseInt(id),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
      },
      include: {
        food: true
      },
      orderBy: { date: 'desc' }
    });

    // Calculate nutrition totals
    const nutritionSummary = mealEntries.reduce((acc, entry) => {
      const multiplier = entry.quantity / 100; // Convert to per 100g basis
      
      acc.totalCalories += entry.food.calories * multiplier;
      acc.totalProtein += entry.food.protein * multiplier;
      acc.totalFat += entry.food.fat * multiplier;
      acc.totalCarbs += entry.food.carbs * multiplier;
      acc.totalFiber += entry.food.fiber * multiplier;
      
      return acc;
    }, {
      totalCalories: 0,
      totalProtein: 0,
      totalFat: 0,
      totalCarbs: 0,
      totalFiber: 0
    });

    // Group by date for daily breakdown
    const dailyBreakdown = mealEntries.reduce((acc, entry) => {
      const date = entry.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          entries: 0
        };
      }
      
      const multiplier = entry.quantity / 100;
      acc[date].calories += entry.food.calories * multiplier;
      acc[date].protein += entry.food.protein * multiplier;
      acc[date].fat += entry.food.fat * multiplier;
      acc[date].carbs += entry.food.carbs * multiplier;
      acc[date].entries += 1;
      
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: nutritionSummary,
        dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => new Date(b.date) - new Date(a.date)),
        totalEntries: mealEntries.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
