const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middlewares/auth');
const Joi = require('joi');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const commentSchema = Joi.object({
  mealEntryId: Joi.number().integer().positive().required(),
  message: Joi.string().min(1).max(1000).required(),
  isPrivate: Joi.boolean().default(false)
});

const commentUpdateSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
  isPrivate: Joi.boolean().optional()
});

// @route   GET /api/comments/meal/:mealEntryId
// @desc    Get comments for a meal entry
// @access  Private (User, their nutritionist, or admin)
router.get('/meal/:mealEntryId', async (req, res, next) => {
  try {
    const { mealEntryId } = req.params;

    // Get meal entry to check permissions
    const mealEntry = await prisma.mealEntry.findUnique({
      where: { id: parseInt(mealEntryId) },
      include: {
        user: {
          select: {
            id: true,
            assignedNutritionistId: true
          }
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

    const comments = await prisma.comment.findMany({
      where: { mealEntryId: parseInt(mealEntryId) },
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
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/comments/user/:userId
// @desc    Get all comments for a user's meal entries
// @access  Private (User, their nutritionist, or admin)
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, isPrivate } = req.query;
    const skip = (page - 1) * limit;

    // Check access permissions
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const canAccess = 
      req.user.id === parseInt(userId) || // Own data
      req.user.role === 'ADMIN' || // Admin access
      (req.user.role === 'NUTRITIONIST' && targetUser.assignedNutritionistId === req.user.id); // Assigned nutritionist

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const where = {
      mealEntry: {
        userId: parseInt(userId)
      }
    };

    if (isPrivate !== undefined) {
      where.isPrivate = isPrivate === 'true';
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          mealEntry: {
            select: {
              id: true,
              date: true,
              mealType: true,
              food: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.comment.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        comments,
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

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private (Nutritionist only)
router.post('/', authorize('NUTRITIONIST', 'ADMIN'), async (req, res, next) => {
  try {
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { mealEntryId } = value;

    // Verify meal entry exists and check permissions
    const mealEntry = await prisma.mealEntry.findUnique({
      where: { id: mealEntryId },
      include: {
        user: {
          select: {
            id: true,
            assignedNutritionistId: true
          }
        }
      }
    });

    if (!mealEntry) {
      return res.status(404).json({
        success: false,
        error: 'Meal entry not found'
      });
    }

    // Check if nutritionist is assigned to this user
    if (req.user.role === 'NUTRITIONIST' && mealEntry.user.assignedNutritionistId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only comment on meal entries of your assigned users'
      });
    }

    const comment = await prisma.comment.create({
      data: {
        ...value,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        mealEntry: {
          select: {
            id: true,
            date: true,
            mealType: true,
            food: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private (Author only)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = commentUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    if (existingComment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own comments.'
      });
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: value,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private (Author or admin only)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    if (existingComment.authorId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only delete your own comments.'
      });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/comments/nutritionist/:nutritionistId/recent
// @desc    Get recent comments by a nutritionist
// @access  Private (Nutritionist viewing own comments or admin)
router.get('/nutritionist/:nutritionistId/recent', async (req, res, next) => {
  try {
    const { nutritionistId } = req.params;
    const { limit = 10 } = req.query;

    // Check permissions
    if (req.user.id !== parseInt(nutritionistId) && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const comments = await prisma.comment.findMany({
      where: { authorId: parseInt(nutritionistId) },
      include: {
        mealEntry: {
          select: {
            id: true,
            date: true,
            mealType: true,
            user: {
              select: {
                id: true,
                name: true
              }
            },
            food: {
              select: {
                name: true
              }
            }
          }
        }
      },
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
