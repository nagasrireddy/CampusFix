// ---------------------------------------------------------
// controllers/authController.js
// Thin controllers for registration, login, and fetching the
// current authenticated profile. All heavy lifting (hashing,
// validation) lives in the model/middleware layers - this
// file only orchestrates the request/response cycle.
// ---------------------------------------------------------

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (student, admin, or technician)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, specialization } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    specialization: role === 'technician' ? specialization : null,
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Authenticate a user and return a JWT
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password since the schema excludes it by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact an administrator.');
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toSafeObject(),
  });
});

// @desc    Get the currently authenticated user's profile
// @route   GET /api/auth/me
// @access  Private (any authenticated role)
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    user: user.toSafeObject(),
  });
});

module.exports = { registerUser, loginUser, getMe };
