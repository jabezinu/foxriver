require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static('uploads'));

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

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Foxriver API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
