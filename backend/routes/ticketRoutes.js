// ---------------------------------------------------------
// routes/ticketRoutes.js
// Every route is wrapped in `protect` (must be logged in) and
// most are further restricted with `authorizeRoles(...)`.
// Route order matters: static paths ("/my", "/queue", "/stats")
// must be declared BEFORE the dynamic "/:id" path, otherwise
// Express would treat "my"/"queue"/"stats" as an :id value.
// ---------------------------------------------------------

const express = require('express');
const router = express.Router();

const {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTechnicianQueue,
  getTicketById,
  assignTicket,
  updateTicketPriority,
  updateTicketStatus,
  getTicketStats,
} = require('../controllers/ticketController');

const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const { handleTicketMediaUpload } = require('../middleware/upload');
const {
  createTicketValidators,
  assignTicketValidators,
  updateStatusValidators,
  updatePriorityValidators,
  validateRequest,
} = require('../utils/validators');

// ---- Student: create + view own tickets ----
router.post(
  '/',
  protect,
  authorizeRoles('student'),
  handleTicketMediaUpload,
  createTicketValidators,
  validateRequest,
  createTicket
);
router.get('/my', protect, authorizeRoles('student'), getMyTickets);

// ---- Admin: full visibility + dashboard metrics ----
router.get('/stats', protect, authorizeRoles('admin'), getTicketStats);
router.get('/', protect, authorizeRoles('admin'), getAllTickets);

// ---- Technician: personal queue ----
router.get('/queue', protect, authorizeRoles('technician'), getTechnicianQueue);

// ---- Shared: fetch single ticket (ownership checked inside controller) ----
router.get('/:id', protect, getTicketById);

// ---- Admin only: assignment + priority triage ----
router.patch(
  '/:id/assign',
  protect,
  authorizeRoles('admin'),
  assignTicketValidators,
  validateRequest,
  assignTicket
);
router.patch(
  '/:id/priority',
  protect,
  authorizeRoles('admin'),
  updatePriorityValidators,
  validateRequest,
  updateTicketPriority
);

// ---- Technician + Admin: status transitions (In Progress / Resolved) ----
router.patch(
  '/:id/status',
  protect,
  authorizeRoles('technician', 'admin'),
  updateStatusValidators,
  validateRequest,
  updateTicketStatus
);

module.exports = router;
