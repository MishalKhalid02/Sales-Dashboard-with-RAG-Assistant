require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const healthRoutes = require('./routes/health');
const verifyToken = require('./middleware/authMiddleware');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const filtersRoutes = require('./routes/filters');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Test database connection
app.use('/api/health', healthRoutes);
app.use('/api', authRoutes);
app.use('/api/filters', verifyToken, filtersRoutes);
app.use('/api', verifyToken, dashboardRoutes);
app.use('/api/chat', verifyToken, chatRoutes);

const PORT = process.env.PORT || 5000;

// Only actually start listening when run locally (node server.js) —
// Vercel imports `app` directly and handles the listening itself.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;

