const express = require('express');
const router = express.Router();
const {
    getDailyTasks,
    completeTask,
    uploadTask,
    getAllTasks,
    deleteTask,
    addPlaylist,
    getPlaylists,
    deletePlaylist,
    syncVideos
} = require('../controllers/taskController');
const { protect, adminOnly, checkInternEarningRestriction, checkPermission } = require('../middlewares/auth');

router.get('/daily', protect, getDailyTasks);
router.post('/:id/complete', protect, checkInternEarningRestriction, completeTask);
router.post('/upload', protect, adminOnly, checkPermission('manage_tasks'), uploadTask);
router.get('/all', protect, adminOnly, checkPermission('manage_tasks'), getAllTasks);
router.delete('/:id', protect, adminOnly, checkPermission('manage_tasks'), deleteTask);

// Playlist management
router.post('/playlists', protect, adminOnly, checkPermission('manage_tasks'), addPlaylist);
router.get('/playlists', protect, adminOnly, checkPermission('manage_tasks'), getPlaylists);
router.delete('/playlists/:id', protect, adminOnly, checkPermission('manage_tasks'), deletePlaylist);
router.post('/playlists/sync', protect, adminOnly, checkPermission('manage_tasks'), syncVideos);

module.exports = router;
