// ---------------------------------------------------------
// utils/generateToken.js
// Signs a JWT embedding the user's id and role. Role is
// included so that even before a DB round-trip, downstream
// systems (e.g., logging) have context - but authoritative
// role checks always re-fetch the user (see middleware/auth.js).
// ---------------------------------------------------------

const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
