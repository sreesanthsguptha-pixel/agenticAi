const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const env = require('./config/env');
const { connectDB, getDBState } = require('./config/db');
const { initSocket } = require('./config/socket');

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Security & Optimization Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
initSocket(server, env.CLIENT_URL);

// API Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = getDBState();
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Agentic AI Automation Platform API',
    version: '1.0.0',
    databaseMode: dbState.isInMemory ? 'IN_MEMORY' : 'MONGODB',
    databaseConnected: dbState.isConnected,
    langGraphStatus: require('./agents/orchestrator').langGraphStatus
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred on the server'
  });
});

// Start Server
const PORT = env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`[Agentflow AI] Backend Server running on port ${PORT}`);
  await connectDB();
});
