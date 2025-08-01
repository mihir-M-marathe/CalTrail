const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedNutritionistId: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please authenticate.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if nutritionist can access user's data
const authorizeNutritionistAccess = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Admin can access everything
    if (currentUser.role === 'admin') {
      return next();
    }

    // Users can only access their own data
    if (currentUser.role === 'user' && currentUser.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own data.'
      });
    }

    // Nutritionists can only access their assigned users
    if (currentUser.role === 'nutritionist') {
      const targetUser = await prisma.user.findUnique({
        where: { id: parseInt(userId) }
      });

      if (!targetUser || targetUser.assignedNutritionistId !== currentUser.id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only access your assigned users.'
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error during authorization check.'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeNutritionistAccess
};
