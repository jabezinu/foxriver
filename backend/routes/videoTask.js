const express = require('express');
const router = express.Router();
const {
    getDailyVideoTasks,
    updateVideoProgress,
    completeVideoTask,
    getVideoTaskStats
} = require('../controllers/videoTaskController');
const { protect, checkInternEarningRestriction } = require('../middlewares/auth');

// Get daily video tasks
router.get('/daily', protect, getDailyVideoTasks);

// Update video watch progress
router.post('/:videoAssignmentId/progress', protect, updateVideoProgress);

// Complete video task
router.post('/:videoAssignmentId/complete', protect, checkInternEarningRestriction, completeVideoTask);

// Get video task statistics
router.get('/stats', protect, getVideoTaskStats);

module.exports = router;