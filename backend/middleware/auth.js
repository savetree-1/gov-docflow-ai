const jwt = require('jsonwebtoken');

/****** Verifying the JWT token ******/
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/****** Role-based authorization for dashboard accessing ******/
const roleMiddleware = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};

module.exports = { authMiddleware, roleMiddleware };
