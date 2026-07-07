// ---------------------------------------------------------
// routes/userRoutes.js
// Admin-only user oversight: listing technicians for the
// ticket-assignment dropdown, listing all users, and toggling
// account activation.
// ---------------------------------------------------------

const express = require('express');
const router = express.Router();

const { getTechnicians, getAllUsers, toggleUserStatus } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.get('/technicians', protect, authorizeRoles('admin'), getTechnicians);
router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.patch('/:id/status', protect, authorizeRoles('admin'), toggleUserStatus);

module.exports = router;
