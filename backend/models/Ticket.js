// ---------------------------------------------------------
// models/Ticket.js
// Core Ticket schema. Holds explicit relational references to
// the User collection for the reporting student, the triaging
// admin, and the assigned technician, plus an auditable
// statusTimeline array for full history tracking.
// ---------------------------------------------------------

const mongoose = require('mongoose');

const STATUS_VALUES = ['Submitted', 'Assigned', 'In Progress', 'Resolved'];
const PRIORITY_VALUES = ['Low', 'Medium', 'High'];

// Sub-document: one entry per status transition, used to render
// the student-facing timeline UI.
const statusTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: STATUS_VALUES,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // Who triggered this transition - useful for audit trails
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
  },
  { _id: false }
);

const locationSchema = new mongoose.Schema(
  {
    labName: {
      type: String,
      required: [true, 'Lab name is required'],
      trim: true,
    },
    rowNumber: {
      type: String,
      required: [true, 'Row number is required'],
      trim: true,
    },
    pcNumber: {
      type: String,
      required: [true, 'PC number is required'],
      trim: true,
    },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A ticket must be linked to the reporting student'],
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue description is required'],
      trim: true,
      minlength: [10, 'Please describe the issue in at least 10 characters'],
      maxlength: [1000, 'Issue description cannot exceed 1000 characters'],
    },
    mediaUrl: {
      type: String,
      default: null, // Cloudinary secure_url
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', null],
      default: null,
    },
    priority: {
      type: String,
      enum: PRIORITY_VALUES,
      default: 'Low',
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'Submitted',
      index: true,
    },
    statusTimeline: {
      type: [statusTimelineSchema],
      default: () => [{ status: 'Submitted' }],
    },
    // Free-text resolution notes added by the technician on completion
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to speed up admin dashboard filters (status + priority)
ticketSchema.index({ status: 1, priority: 1 });

// Static helper exposing allowed enum values to controllers/validators
ticketSchema.statics.STATUS_VALUES = STATUS_VALUES;
ticketSchema.statics.PRIORITY_VALUES = PRIORITY_VALUES;

module.exports = mongoose.model('Ticket', ticketSchema);
