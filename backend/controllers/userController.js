// ---------------------------------------------------------
// controllers/userController.js
// Admin-facing user management: listing technicians (needed
// to populate the "assign to" dropdown) and toggling account
// activation status.
// ---------------------------------------------------------

const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    List all technicians (optionally filter by specialization)
// @route   GET /api/users/technicians
// @access  Private (admin)
const getTechnicians = asyncHandler(async (req, res) => {
  const { specialization } = req.query;

  const filter = { role: 'technician' };
  if (specialization) filter.specialization = specialization;

  const technicians = await User.find(filter).select('name email specialization isActive');

  res.status(200).json({ success: true, count: technicians.length, technicians });
});

// @desc    List all users (admin oversight view)
// @route   GET /api/users
// @access  Private (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter).select('name email role specialization isActive createdAt');
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc    Activate or deactivate a user account
// @route   PATCH /api/users/:id/status
// @access  Private (admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent an admin from locking themselves out accidentally
  if (user._id.toString() === req.user.id && isActive === false) {
    res.status(400);
    throw new Error('You cannot deactivate your own account');
  }

  user.isActive = !!isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    user: user.toSafeObject(),
  });
});

module.exports = { getTechnicians, getAllUsers, toggleUserStatus };
