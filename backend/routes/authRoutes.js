// ---------------------------------------------------------
// routes/authRoutes.js
// Public registration/login endpoints plus a protected
// "who am I" endpoint used by the frontend on app boot to
// restore session state safely from a stored JWT.
// ---------------------------------------------------------

const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidators,
  loginValidators,
  validateRequest,
} = require('../utils/validators');

router.post('/register', registerValidators, validateRequest, registerUser);
router.post('/login', loginValidators, validateRequest, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
