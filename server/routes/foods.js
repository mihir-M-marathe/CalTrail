const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middlewares/auth');
const Joi = require('joi');

const router = express.Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// Validation schemas
const foodSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  brand: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  calories: Joi.number().min(0).required(),
  protein: Joi.number().min(0).default(0),
  fat: Joi.number().min(0).default(0),
  carbs: Joi.number().min(0).default(0),
  fiber: Joi.number().min(0).default(0),
  sugar: Joi.number().min(0).default(0),
  sodium: Joi.number().min(0).default(0),
  vitaminA: Joi.number().min(0).optional(),
  vitaminC: Joi.number().min(0).optional(),
  calcium: Joi.number().min(0).optional(),
  iron: Joi.number().min(0).optional()
});

// @route   GET /api/foods
// @desc    Get all foods with pagination and search
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, source } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (source) {
      where.source = source;
    }

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.food.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        foods,
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

// @route   GET /api/foods/:id
// @desc    Get food by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const food = await prisma.food.findUnique({
      where: { id: parseInt(id) }
    });

    if (!food) {
      return res.status(404).json({
        success: false,
        error: 'Food not found'
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/foods
// @desc    Create a new food entry
// @access  Private (Nutritionist/Admin)
router.post('/', authorize('NUTRITIONIST', 'ADMIN'), async (req, res, next) => {
  try {
    const { error, value } = foodSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const food = await prisma.food.create({
      data: {
        ...value,
        source: 'CUSTOM'
      }
    });

    res.status(201).json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/foods/:id
// @desc    Update food entry
// @access  Private (Nutritionist/Admin)
router.put('/:id', authorize('NUTRITIONIST', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = foodSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const food = await prisma.food.update({
      where: { id: parseInt(id) },
      data: value
    });

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/foods/:id
// @desc    Delete food entry
// @access  Private (Admin only)
router.delete('/:id', authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if food is used in any meal entries
    const mealEntryCount = await prisma.mealEntry.count({
      where: { foodId: parseInt(id) }
    });

    if (mealEntryCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete food that is used in meal entries'
      });
    }

    await prisma.food.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Food deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/foods/search/usda
// @desc    Search USDA food database
// @access  Private
router.get('/search/usda', async (req, res, next) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    if (!process.env.USDA_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'USDA API key not configured'
      });
    }

    const response = await axios.get(`${process.env.USDA_API_URL}/foods/search`, {
      params: {
        query,
        pageSize: limit,
        api_key: process.env.USDA_API_KEY
      }
    });

    const foods = response.data.foods?.map(food => ({
      usdaFdcId: food.fdcId,
      name: food.description,
      brand: food.brandOwner || null,
      description: food.additionalDescriptions?.join(', ') || null,
      source: 'USDA'
    })) || [];

    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('USDA API Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search USDA database'
    });
  }
});

// @route   POST /api/foods/import/usda/:fdcId
// @desc    Import food from USDA database
// @access  Private
router.post('/import/usda/:fdcId', async (req, res, next) => {
  try {
    const { fdcId } = req.params;

    if (!process.env.USDA_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'USDA API key not configured'
      });
    }

    // Check if food already exists
    const existingFood = await prisma.food.findUnique({
      where: { usdaFdcId: parseInt(fdcId) }
    });

    if (existingFood) {
      return res.json({
        success: true,
        data: existingFood,
        message: 'Food already exists in database'
      });
    }

    // Fetch detailed food data from USDA
    const response = await axios.get(`${process.env.USDA_API_URL}/food/${fdcId}`, {
      params: {
        api_key: process.env.USDA_API_KEY
      }
    });

    const usdaFood = response.data;
    
    // Extract nutrients
    const nutrients = {};
    usdaFood.foodNutrients?.forEach(nutrient => {
      const name = nutrient.nutrient?.name?.toLowerCase();
      const value = nutrient.amount || 0;
      
      if (name?.includes('energy') || name?.includes('calorie')) {
        nutrients.calories = value;
      } else if (name?.includes('protein')) {
        nutrients.protein = value;
      } else if (name?.includes('total lipid') || name?.includes('fat, total')) {
        nutrients.fat = value;
      } else if (name?.includes('carbohydrate')) {
        nutrients.carbs = value;
      } else if (name?.includes('fiber')) {
        nutrients.fiber = value;
      } else if (name?.includes('sugars')) {
        nutrients.sugar = value;
      } else if (name?.includes('sodium')) {
        nutrients.sodium = value;
      }
    });

    // Create food entry
    const food = await prisma.food.create({
      data: {
        name: usdaFood.description,
        brand: usdaFood.brandOwner || null,
        description: usdaFood.additionalDescriptions?.join(', ') || null,
        source: 'USDA',
        usdaFdcId: parseInt(fdcId),
        calories: nutrients.calories || 0,
        protein: nutrients.protein || 0,
        fat: nutrients.fat || 0,
        carbs: nutrients.carbs || 0,
        fiber: nutrients.fiber || 0,
        sugar: nutrients.sugar || 0,
        sodium: nutrients.sodium || 0
      }
    });

    res.status(201).json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('USDA Import Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to import food from USDA database'
    });
  }
});

module.exports = router;
