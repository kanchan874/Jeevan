const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();

// Configure CORS allowed origins dynamically
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy: Access denied for origin ' + origin));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Passport initialization
app.use(passport.initialize());
require('./config/passport')();

// Root route for sanity checks
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Jeevan Blood Donation API (MERN Conversion)',
    status: 'Running'
  });
});

// Register routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Server Error]', err.stack);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
