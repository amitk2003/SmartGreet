require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const templateRoutes = require('./routes/templateRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ===================================================
// MIDDLEWARE
// ===================================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // 10mb for base64 photos
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger (simple, like a fresher would write it)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.path}`);
  next();
});

// ===================================================
// ROUTES
// ===================================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ClaasPlus API is running! 🎉',
    timestamp: new Date().toISOString(),
  });
});

// ===================================================
// 404 HANDLER
// ===================================================
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.path} not found.` });
});

// ===================================================
// GLOBAL ERROR HANDLER
// ===================================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong. Please try again.',
  });
});

// ===================================================
// START SERVER
// ===================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ClaasPlus server running on http://localhost:${PORT}`);
  console.log(`📋 API docs: http://localhost:${PORT}/api/health`);
});
