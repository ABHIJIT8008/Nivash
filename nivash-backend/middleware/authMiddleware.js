const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verifies the token
const protect = async (req, res, next) => {
  let token;

  // Check if the token is in the headers and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token payload
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID, but don't return the password hash
      req.user = await User.findById(decoded.id).select('-password_hash');

      next(); // Pass control to the next middleware or controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // If the user's role isn't in the allowed roles array, reject them
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };