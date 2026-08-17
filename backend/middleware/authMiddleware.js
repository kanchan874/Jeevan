const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../config/jwtConfig');

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, getJwtSecret());

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found in database' });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware Error] Token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
