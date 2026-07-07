// ---------------------------------------------------------
// controllers/ticketController.js
// Core ticket lifecycle logic shared by all three portals.
// Role permissions are enforced here AND at the route layer
// (defense in depth) - e.g. only an admin may set technicianId,
// only a technician/admin may push status to 'Resolved'.
// ---------------------------------------------------------

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// Fields populated on every ticket response so the frontend never
// needs a second round-trip to resolve names for student/tech/admin.
const POPULATE_FIELDS = [
  { path: 'studentId', select: 'name email' },
  { path: 'adminId', select: 'name email' },
  { path: 'technicianId', select: 'name email specialization' },
];

// ---------------------------------------------------------
// @desc    Student creates a new ticket, optionally with a
//          Cloudinary-hosted proof image/video attached.
// @route   POST /api/tickets
// @access  Private (student)
// ---------------------------------------------------------
const createTicket = asyncHandler(async (req, res) => {
  const { labName, rowNumber, pcNumber, issueDescription } = req.body;

  const ticketData = {
    studentId: req.user.id,
    location: { labName, rowNumber, pcNumber },
    issueDescription,
    statusTimeline: [{ status: 'Submitted', updatedBy: req.user.id }],
  };

  // req.file is populated by the Cloudinary/Multer middleware if a file was sent
  if (req.file) {
    ticketData.mediaUrl = req.file.path; // Cloudinary secure_url
    ticketData.mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
  }

  const ticket = await Ticket.create(ticketData);
  const populated = await ticket.populate(POPULATE_FIELDS);

  res.status(201).json({
    success: true,
    message: 'Ticket submitted successfully',
    ticket: populated,
  });
});

// ---------------------------------------------------------
// @desc    Student fetches only their own submitted tickets
// @route   GET /api/tickets/my
// @access  Private (student)
// ---------------------------------------------------------
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ studentId: req.user.id })
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: tickets.length, tickets });
});

// ---------------------------------------------------------
// @desc    Admin fetches all tickets with optional filters
//          (?status=, ?priority=, ?technicianId=)
// @route   GET /api/tickets
// @access  Private (admin)
// ---------------------------------------------------------
const getAllTickets = asyncHandler(async (req, res) => {
  const { status, priority, technicianId } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (technicianId && mongoose.isValidObjectId(technicianId)) {
    filter.technicianId = technicianId;
  }

  const tickets = await Ticket.find(filter)
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: tickets.length, tickets });
});

// ---------------------------------------------------------
// @desc    Technician fetches only tickets assigned to them
// @route   GET /api/tickets/queue
// @access  Private (technician)
// ---------------------------------------------------------
const getTechnicianQueue = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({
    technicianId: req.user.id,
    status: { $in: ['Assigned', 'In Progress'] },
  })
    .populate(POPULATE_FIELDS)
    // High priority first, then oldest first (FIFO within priority band)
    .sort({ priority: -1, createdAt: 1 });

  res.status(200).json({ success: true, count: tickets.length, tickets });
});

// ---------------------------------------------------------
// @desc    Fetch a single ticket by id (any authenticated role,
//          but a student may only view their own ticket and a
//          technician may only view a ticket assigned to them).
// @route   GET /api/tickets/:id
// @access  Private
// ---------------------------------------------------------
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate(POPULATE_FIELDS);

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  const isOwnerStudent = req.user.role === 'student' && ticket.studentId._id.toString() === req.user.id;
  const isAssignedTechnician =
    req.user.role === 'technician' &&
    ticket.technicianId &&
    ticket.technicianId._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwnerStudent && !isAssignedTechnician && !isAdmin) {
    res.status(403);
    throw new Error('You do not have permission to view this ticket');
  }

  res.status(200).json({ success: true, ticket });
});

// ---------------------------------------------------------
// @desc    Admin assigns a technician to a ticket and sets
//          triage priority. This is the ONLY endpoint allowed
//          to mutate technicianId - enforced by route-level
//          authorizeRoles('admin') plus this handler.
// @route   PATCH /api/tickets/:id/assign
// @access  Private (admin only)
// ---------------------------------------------------------
const assignTicket = asyncHandler(async (req, res) => {
  const { technicianId, priority } = req.body;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  const technician = await User.findOne({ _id: technicianId, role: 'technician' });
  if (!technician) {
    res.status(404);
    throw new Error('Selected technician not found or is not a valid technician account');
  }

  if (!technician.isActive) {
    res.status(400);
    throw new Error('Cannot assign a deactivated technician');
  }

  ticket.technicianId = technician._id;
  ticket.adminId = req.user.id;
  if (priority) ticket.priority = priority;
  ticket.status = 'Assigned';
  ticket.statusTimeline.push({
    status: 'Assigned',
    updatedBy: req.user.id,
    note: `Assigned to ${technician.name} (${technician.specialization})`,
  });

  await ticket.save();
  const populated = await ticket.populate(POPULATE_FIELDS);

  res.status(200).json({
    success: true,
    message: `Ticket assigned to ${technician.name}`,
    ticket: populated,
  });
});

// ---------------------------------------------------------
// @desc    Admin updates only the priority of a ticket
//          (independent of assignment, e.g. re-triaging).
// @route   PATCH /api/tickets/:id/priority
// @access  Private (admin only)
// ---------------------------------------------------------
const updateTicketPriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  ticket.priority = priority;
  await ticket.save();
  const populated = await ticket.populate(POPULATE_FIELDS);

  res.status(200).json({ success: true, message: 'Priority updated', ticket: populated });
});

// ---------------------------------------------------------
// @desc    Technician (or admin) transitions a ticket's status.
//          Only the assigned technician or an admin may move a
//          ticket to 'In Progress' or 'Resolved'.
// @route   PATCH /api/tickets/:id/status
// @access  Private (technician, admin)
// ---------------------------------------------------------
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  const isAssignedTechnician =
    req.user.role === 'technician' &&
    ticket.technicianId &&
    ticket.technicianId.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isAssignedTechnician && !isAdmin) {
    res.status(403);
    throw new Error('Only the assigned technician or an admin can update this ticket\'s status');
  }

  // Enforce a sane forward progression: cannot resolve an unassigned ticket
  if (status === 'Resolved' && !ticket.technicianId) {
    res.status(400);
    throw new Error('A ticket must be assigned to a technician before it can be resolved');
  }
  if (status === 'In Progress' && !ticket.technicianId) {
    res.status(400);
    throw new Error('A ticket must be assigned before work can begin');
  }

  ticket.status = status;
  if (status === 'Resolved' && note) {
    ticket.resolutionNotes = note;
  }
  ticket.statusTimeline.push({ status, updatedBy: req.user.id, note: note || '' });

  await ticket.save();
  const populated = await ticket.populate(POPULATE_FIELDS);

  res.status(200).json({ success: true, message: `Ticket marked as ${status}`, ticket: populated });
});

// ---------------------------------------------------------
// @desc    Basic dashboard metrics for the admin portal
// @route   GET /api/tickets/stats
// @access  Private (admin)
// ---------------------------------------------------------
const getTicketStats = asyncHandler(async (req, res) => {
  const [statusCounts, priorityCounts, total] = await Promise.all([
    Ticket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Ticket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Ticket.countDocuments(),
  ]);

  const byStatus = statusCounts.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});
  const byPriority = priorityCounts.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});

  res.status(200).json({
    success: true,
    stats: {
      total,
      byStatus: {
        Submitted: byStatus.Submitted || 0,
        Assigned: byStatus.Assigned || 0,
        'In Progress': byStatus['In Progress'] || 0,
        Resolved: byStatus.Resolved || 0,
      },
      byPriority: {
        Low: byPriority.Low || 0,
        Medium: byPriority.Medium || 0,
        High: byPriority.High || 0,
      },
    },
  });
});

module.exports = {
  createTicket,
  getMyTickets,
  getAllTickets,
  getTechnicianQueue,
  getTicketById,
  assignTicket,
  updateTicketPriority,
  updateTicketStatus,
  getTicketStats,
};
