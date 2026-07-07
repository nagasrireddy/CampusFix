// ---------------------------------------------------------
// utils/validators.js
// Centralized express-validator rule chains for every mutating
// endpoint, plus a shared middleware that inspects the
// validation result and short-circuits with a 400 on failure.
// Keeping these here (rather than inline in routes) keeps
// route files declarative and controllers free of parsing logic.
// ---------------------------------------------------------

const { body, param, validationResult } = require('express-validator');

// Run after any validator chain to reject the request on failure
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const message = errors
      .array()
      .map((e) => e.msg)
      .join('. ');
    throw new Error(message);
  }
  next();
};

// ---------------------------------------------------------
// Auth validators
// ---------------------------------------------------------
const registerValidators = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('role')
    .isIn(['student', 'admin', 'technician'])
    .withMessage('Role must be student, admin, or technician'),
  body('specialization')
    .if(body('role').equals('technician'))
    .notEmpty()
    .withMessage('Technicians must specify a specialization')
    .isIn(['Network', 'Hardware', 'Software', 'Electrical', 'General'])
    .withMessage('Invalid specialization value'),
];

const loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ---------------------------------------------------------
// Ticket validators
// ---------------------------------------------------------
const createTicketValidators = [
  body('labName').trim().notEmpty().withMessage('Lab name is required'),
  body('rowNumber').trim().notEmpty().withMessage('Row number is required'),
  body('pcNumber').trim().notEmpty().withMessage('PC number is required'),
  body('issueDescription')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Issue description must be 10-1000 characters'),
];

const assignTicketValidators = [
  param('id').isMongoId().withMessage('Invalid ticket id'),
  body('technicianId').isMongoId().withMessage('A valid technicianId is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
];

const updateStatusValidators = [
  param('id').isMongoId().withMessage('Invalid ticket id'),
  body('status')
    .isIn(['Submitted', 'Assigned', 'In Progress', 'Resolved'])
    .withMessage('Invalid status value'),
  body('note').optional().trim().isLength({ max: 300 }).withMessage('Note cannot exceed 300 characters'),
];

const updatePriorityValidators = [
  param('id').isMongoId().withMessage('Invalid ticket id'),
  body('priority').isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
];

module.exports = {
  validateRequest,
  registerValidators,
  loginValidators,
  createTicketValidators,
  assignTicketValidators,
  updateStatusValidators,
  updatePriorityValidators,
};
