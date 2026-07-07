// ---------------------------------------------------------
// server.js
// Application entry point. Wires up middleware, security
// headers, routes, and the centralized error handler. Keeps
// the file lean by delegating all real logic to routes/
// controllers/services - "thin controllers" principle applied
// one level up at the bootstrap layer too.
// ---------------------------------------------------------

require('dotenv').config();
// console.log("MONGO_URI:", process.env.MONGO_URI);
// console.log("All env keys:", Object.keys(process.env).includes("MONGO_URI"));

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const xssClean = require('xss-clean');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');

// Establish the MongoDB Atlas connection before accepting traffic
connectDB();

const app = express();

// ---- Security & parsing middleware ----
app.use(helmet()); // sets sane security-related HTTP headers
app.use(xssClean()); // sanitizes req.body/query/params against XSS payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS - restrict to the configured frontend origin(s) only
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (no origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Request logging (dev-friendly, silent in production if desired)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'CampusFix API is running', timestamp: new Date() });
});

// ---- Route mounting ----
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// ---- 404 + centralized error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[CampusFix API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
