const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Update last active date (avoid saving a partially-selected document)
    User.updateOne(
      { _id: user._id },
      { $set: { 'stats.lastActiveDate': new Date() } }
    ).catch((e) => console.error('Failed to update lastActiveDate:', e));

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user has specific subscription plan
const requireSubscription = (requiredPlan = 'premium') => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const planHierarchy = {
      'free': 0,
      'premium': 1,
      'pro': 2
    };

    const userPlanLevel = planHierarchy[user.subscription.plan] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 1;

    if (userPlanLevel < requiredPlanLevel) {
      return res.status(403).json({
        success: false,
        message: `${requiredPlan} subscription required`,
        currentPlan: user.subscription.plan,
        requiredPlan: requiredPlan
      });
    }

    // Check if subscription is active
    if (!user.subscription.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Subscription is not active',
        currentPlan: user.subscription.plan
      });
    }

    // Check if subscription has expired
    if (user.subscription.endDate && new Date() > user.subscription.endDate) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired',
        expiredDate: user.subscription.endDate
      });
    }

    next();
  };
};

// Middleware to check if user is admin (for future admin features)
const requireAdmin = (req, res, next) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Middleware to validate request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'prepiq-api',
      audience: 'prepiq-users'
    }
  );
};

// Generate refresh token (for future implementation)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { 
      expiresIn: '30d',
      issuer: 'prepiq-api',
      audience: 'prepiq-users'
    }
  );
};

module.exports = {
  authenticateToken,
  requireSubscription,
  requireAdmin,
  validateRequest,
  generateToken,
  generateRefreshToken
};
