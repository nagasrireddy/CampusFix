// ---------------------------------------------------------
// middleware/auth.js
// Verifies the JWT sent by the client (Authorization: Bearer)
// and attaches the authenticated user document to req.user.
// This is the first gate every protected route passes through.
// ---------------------------------------------------------

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized - no authentication token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user record (never trust stale token claims for role checks)
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized - user account no longer exists');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('This account has been deactivated. Contact an administrator.');
    }

    // Attach a lean, safe representation to the request for downstream handlers
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
    };

    next();
  } catch (error) {
    res.status(401);
    if (error.name === 'TokenExpiredError') {
      throw new Error('Session expired - please log in again');
    }
    throw new Error('Not authorized - invalid authentication token');
  }
});

module.exports = { protect };
