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
const { protect, adminOnly, checkInternEarningRestriction } = require('../middlewares/auth');

router.get('/daily', protect, getDailyTasks);
router.post('/:id/complete', protect, checkInternEarningRestriction, completeTask);
router.post('/upload', protect, adminOnly, uploadTask);
router.get('/all', protect, adminOnly, getAllTasks);
router.delete('/:id', protect, adminOnly, deleteTask);

// Playlist management
router.post('/playlists', protect, adminOnly, addPlaylist);
router.get('/playlists', protect, adminOnly, getPlaylists);
router.delete('/playlists/:id', protect, adminOnly, deletePlaylist);
router.post('/playlists/sync', protect, adminOnly, syncVideos);

module.exports = router;
