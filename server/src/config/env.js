const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-agentflow-ai-2026',
  CREDENTIAL_ENCRYPTION_KEY: process.env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/agentflow_ai',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
