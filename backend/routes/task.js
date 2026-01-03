const express = require('express');
const router = express.Router();
const {
    getDailyTasks,
    completeTask,
    uploadTask,
    getAllTasks,
    deleteTask
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middlewares/auth');

router.get('/daily', protect, getDailyTasks);
router.post('/:id/complete', protect, completeTask);
router.post('/upload', protect, adminOnly, uploadTask);
router.get('/all', protect, adminOnly, getAllTasks);
router.delete('/:id', protect, adminOnly, deleteTask);

module.exports = router;
