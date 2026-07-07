// ---------------------------------------------------------
// models/User.js
// Mongoose schema for all three portal roles: student, admin,
// technician. Password is always stored bcrypt-hashed, never
// in plaintext, and is excluded from queries by default.
// ---------------------------------------------------------

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // never returned by default in queries
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin', 'technician'],
        message: '{VALUE} is not a supported role',
      },
      required: [true, 'Role is required'],
      default: 'student',
    },
    // Only meaningful when role === 'technician'
    specialization: {
      type: String,
      enum: ['Network', 'Hardware', 'Software', 'Electrical', 'General', null],
      default: null,
      validate: {
        validator: function (value) {
          // If the user is a technician, a specialization should be set.
          if (this.role === 'technician') {
            return !!value;
          }
          return true;
        },
        message: 'Technicians must have a specialization assigned',
      },
    },
    // Soft-disable flag - admins can deactivate accounts without deleting history
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// ---------------------------------------------------------
// Pre-save hook: hash password whenever it is new or modified
// ---------------------------------------------------------
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ---------------------------------------------------------
// Instance method: compare plaintext candidate against hash
// ---------------------------------------------------------
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never leak the password hash even if select('+password') was used upstream
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
