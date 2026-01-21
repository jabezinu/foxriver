require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/database');
const logger = require('./config/logger');
const { initializeSalaryScheduler } = require('./services/salaryScheduler');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { securityHeaders, sanitizeInput, apiLimiter } = require('./middlewares/security');

// Import all models to ensure they're registered with Sequelize
require('./models');

const app = express();

// Connect to MySQL
connectDB();

// Create admin user automatically on startup
setTimeout(() => {
    const createAdminUser = require('./scripts/createAdminUser');
    createAdminUser().catch(err => {
        logger.warn('Could not create admin user:', err.message);
    });
}, 2000);

// Add database indexes automatically on startup (runs once, safe to run multiple times)
setTimeout(() => {
    const { addAllIndexes } = require('./scripts/addIndexes');
    addAllIndexes().catch(err => {
        logger.warn('Could not add database indexes:', err.message);
        logger.info('Server will continue running. You can add indexes manually later with: npm run add-indexes');
    });
}, 3000);

// Initialize salary scheduler after DB connection
setTimeout(() => {
    initializeSalaryScheduler();
}, 2000);

// Security middleware
app.use(securityHeaders);
app.use(sanitizeInput);

// Compression middleware
app.use(compression());

// CORS configuration - Allow all origins (development mode)
// WARNING: In production, restrict this to specific domains
const corsOptions = {
    origin: true, // Allow all origins
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder for uploads (before rate limiting)
app.use('/uploads', express.static('uploads'));

// Rate limiting for API routes only (not static files)
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/deposits', require('./routes/deposit'));
app.use('/api/withdrawals', require('./routes/withdrawal'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/video-tasks', require('./routes/videoTask'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/memberships', require('./routes/membership'));
app.use('/api/referrals', require('./routes/referral'));
app.use('/api/qna', require('./routes/qna'));
app.use('/api/news', require('./routes/news'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bank', require('./routes/bank'));
app.use('/api/spin', require('./routes/spin'));
app.use('/api/slot-tiers', require('./routes/slotTier'));
app.use('/api/system', require('./routes/system'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/wealth', require('./routes/wealth'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Foxriver API is running',
        database: 'MySQL',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler (must be before error handler)
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info('Database: MySQL (Sequelize ORM)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
});
