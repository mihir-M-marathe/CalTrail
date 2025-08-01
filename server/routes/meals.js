const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeNutritionistAccess } = require('../middlewares/auth');
const Joi = require('joi');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const mealEntrySchema = Joi.object({
  foodId: Joi.number().integer().positive().required(),
  quantity: Joi.number().positive().required(),
  date: Joi.date().default(() => new Date()),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').optional(),
  notes: Joi.string().max(500).optional()
});

const mealEntryUpdateSchema = Joi.object({
  quantity: Joi.number().positive().optional(),
  date: Joi.date().optional(),
  mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').optional(),
  notes: Joi.string().max(500).optional()
});

// @route   GET /api/meals/user/:userId
// @desc    Get meal entries for a user
// @access  Private (Own data or authorized nutritionist)
router.get('/user/:userId', authorizeNutritionistAccess, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate, 
      mealType,
      includeFoodDetails = 'true'
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {
      userId: parseInt(userId)
    };
    
    // Date filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    // Meal type filtering
    if (mealType) {
      where.mealType = mealType;
    }

    const includeOptions = {
      food: includeFoodDetails === 'true'
    };

    const [mealEntries, total] = await Promise.all([
      prisma.mealEntry.findMany({
        where,
        include: includeOptions,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.mealEntry.count({ where })
    ]);

    // Calculate nutrition totals for this page
    const nutritionTotals = mealEntries.reduce((acc, entry) => {
      if (entry.food) {
        const multiplier = entry.quantity / 100;
        acc.calories += entry.food.calories * multiplier;
        acc.protein += entry.food.protein * multiplier;
        acc.fat += entry.food.fat * multiplier;
        acc.carbs += entry.food.carbs * multiplier;
        acc.fiber += entry.food.fiber * multiplier;
      }
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 });

    res.json({
      success: true,
      data: {
        mealEntries,
        nutritionTotals,
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

// @route   GET /api/meals/:id
// @desc    Get meal entry by ID
// @access  Private (Own data or authorized nutritionist)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const mealEntry = await prisma.mealEntry.findUnique({
      where: { id: parseInt(id) },
      include: {
        food: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!mealEntry) {
      return res.status(404).json({
        success: false,
        error: 'Meal entry not found'
      });
    }

    // Check access permissions
    const canAccess = 
      req.user.id === mealEntry.userId || // Own data
      req.user.role === 'ADMIN' || // Admin access
      (req.user.role === 'NUTRITIONIST' && mealEntry.user.assignedNutritionistId === req.user.id); // Assigned nutritionist

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: mealEntry
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/meals
// @desc    Create a new meal entry
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { error, value } = mealEntrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { foodId } = value;

    // Verify food exists
    const food = await prisma.food.findUnique({
      where: { id: foodId }
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    const mealEntry = await prisma.mealEntry.create({
      data: {
        ...value,
        userId: req.user.id
      },
      include: {
        food: true
      }
    });

    res.status(201).json({
      success: true,
      data: mealEntry
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/meals/:id
// @desc    Update meal entry
// @access  Private (Own data only)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = mealEntryUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if meal entry exists and belongs to user
    const existingEntry = await prisma.mealEntry.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        error: 'Meal entry not found'
      });
    }

    if (existingEntry.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own meal entries.'
      });
    }

    const mealEntry = await prisma.mealEntry.update({
      where: { id: parseInt(id) },
      data: value,
      include: {
        food: true
      }
    });

    res.json({
      success: true,
      data: mealEntry
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/meals/:id
// @desc    Delete meal entry
// @access  Private (Own data only)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if meal entry exists and belongs to user
    const existingEntry = await prisma.mealEntry.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        error: 'Meal entry not found'
      });
    }

    if (existingEntry.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only delete your own meal entries.'
      });
    }

    await prisma.mealEntry.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Meal entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/meals/user/:userId/daily/:date
// @desc    Get daily nutrition summary for a specific date
// @access  Private (Own data or authorized nutritionist)
router.get('/user/:userId/daily/:date', authorizeNutritionistAccess, async (req, res, next) => {
  try {
    const { userId, date } = req.params;
    const targetDate = new Date(date);
    
    // Get start and end of day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const mealEntries = await prisma.mealEntry.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        food: true
      },
      orderBy: { date: 'asc' }
    });

    // Group by meal type
    const mealsByType = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      other: []
    };

    // Calculate totals
    const totals = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    mealEntries.forEach(entry => {
      const mealType = entry.mealType || 'other';
      mealsByType[mealType].push(entry);
      
      // Calculate nutrition
      const multiplier = entry.quantity / 100;
      totals.calories += entry.food.calories * multiplier;
      totals.protein += entry.food.protein * multiplier;
      totals.fat += entry.food.fat * multiplier;
      totals.carbs += entry.food.carbs * multiplier;
      totals.fiber += entry.food.fiber * multiplier;
      totals.sugar += entry.food.sugar * multiplier;
      totals.sodium += entry.food.sodium * multiplier;
    });

    res.json({
      success: true,
      data: {
        date: targetDate.toISOString().split('T')[0],
        totals,
        mealsByType,
        totalEntries: mealEntries.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/meals/user/:userId/weekly
// @desc    Get weekly nutrition summary
// @access  Private (Own data or authorized nutritionist)
router.get('/user/:userId/weekly', authorizeNutritionistAccess, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { startDate } = req.query;
    
    const weekStart = startDate ? new Date(startDate) : new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const mealEntries = await prisma.mealEntry.findMany({
      where: {
        userId: parseInt(userId),
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        food: true
      },
      orderBy: { date: 'asc' }
    });

    // Group by day
    const dailyData = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = {
        date: dateStr,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        entries: 0
      };
    }

    // Calculate daily totals
    mealEntries.forEach(entry => {
      const dateStr = entry.date.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        const multiplier = entry.quantity / 100;
        dailyData[dateStr].calories += entry.food.calories * multiplier;
        dailyData[dateStr].protein += entry.food.protein * multiplier;
        dailyData[dateStr].fat += entry.food.fat * multiplier;
        dailyData[dateStr].carbs += entry.food.carbs * multiplier;
        dailyData[dateStr].entries += 1;
      }
    });

    // Calculate weekly averages
    const weeklyTotals = Object.values(dailyData).reduce((acc, day) => {
      acc.calories += day.calories;
      acc.protein += day.protein;
      acc.fat += day.fat;
      acc.carbs += day.carbs;
      acc.entries += day.entries;
      return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0, entries: 0 });

    const weeklyAverages = {
      calories: weeklyTotals.calories / 7,
      protein: weeklyTotals.protein / 7,
      fat: weeklyTotals.fat / 7,
      carbs: weeklyTotals.carbs / 7
    };

    res.json({
      success: true,
      data: {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        dailyData: Object.values(dailyData),
        weeklyTotals,
        weeklyAverages,
        totalEntries: weeklyTotals.entries
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
