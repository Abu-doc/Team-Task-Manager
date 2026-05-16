require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// 1. Import all route orchestrators
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// 🛡️ Security Configuration & Body Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite development server
  credentials: true
}));

// Crucial: These must be declared BEFORE routes to unpack JSON payloads cleanly
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 2. Mount API Routes to Target Base Endpoints
app.use('/api/auth', authRoutes);        // Standardizes paths to: /api/auth/register and /api/auth/login
app.use('/api/projects', projectRoutes);  // Standardizes paths to: /api/projects
app.use('/api/tasks', taskRoutes);        // Standardizes paths to: /api/tasks

// Heartbeat Health Monitor Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'operational', timestamp: new Date() });
});

// Global Fallback Error Interceptor
app.use((err, req, res, next) => {
  console.error("Unhandled System Runtime Exception:", err.stack);
  res.status(500).json({ error: 'Internal server error occurred within operational engine.' });
});

// 🚀 Start the Server Engine
app.listen(PORT, () => {
  console.log(`Server executing on port ${PORT}`);
});