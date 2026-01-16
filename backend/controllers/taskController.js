const { Task, TaskCompletion, User, Membership, Playlist, VideoPool, SystemSetting, sequelize } = require('../models');
const taskService = require('../services/taskService');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const ytpl = require('ytpl');

// @desc    Get daily tasks for user
// @route   GET /api/tasks/daily
// @access  Private
exports.getDailyTasks = asyncHandler(async (req, res) => {
    const result = await taskService.getDailyTasks(req.user.id);

    // Calculate earnings summary for response (if tasks exist)
    let earningsStats = {
        todayEarnings: 0,
        completedTasks: 0,
        remainingTasks: 0,
        totalPossibleEarnings: 0
    };

    if (result.tasks && result.tasks.length > 0) {
        const completedCount = result.tasks.filter(t => t.isCompleted).length;
        const perVideo = result.perVideoIncome || 0;

        earningsStats = {
            todayEarnings: completedCount * perVideo,
            completedTasks: completedCount,
            remainingTasks: result.tasks.length - completedCount,
            totalPossibleEarnings: result.tasks.length * perVideo
        };
    }

    res.status(200).json({
        success: true,
        count: result.tasks ? result.tasks.length : 0,
        ...result,
        earningsStats
    });
});

// @desc    Complete a task
// @route   POST /api/tasks/:id/complete
// @access  Private
exports.completeTask = asyncHandler(async (req, res) => {
    const result = await taskService.completeTask(req.user.id, req.params.id);

    res.status(200).json({
        success: true,
        message: 'Task completed successfully',
        ...result
    });
});

// @desc    Upload task YouTube URL (admin) -> Adds to Video Pool
// @route   POST /api/tasks/upload
// @access  Private/Admin
exports.uploadTask = asyncHandler(async (req, res) => {
    const { youtubeUrl, title } = req.body;

    if (!youtubeUrl) {
        throw new AppError('Please provide a YouTube URL', 400);
    }

    // Extract video ID from URL (simple check)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) {
        throw new AppError('Invalid YouTube URL', 400);
    }

    // Check if exists in pool
    const existing = await VideoPool.findOne({ where: { videoId } });
    if (existing) {
        throw new AppError('Video already in pool', 400);
    }

    const poolVideo = await VideoPool.create({
        videoId,
        videoUrl: youtubeUrl,
        title: title || 'YouTube Video Task',
        // playlist: null (default)
    });

    res.status(201).json({
        success: true,
        message: 'Video added to pool successfully',
        task: poolVideo // Returning as 'task' to maintain some frontend compat if needed, but better to be explicit
    });
});

// @desc    Get all pool videos (admin)
// @route   GET /api/tasks/pool
// @access  Private/Admin
exports.getAllTasks = asyncHandler(async (req, res) => {
    // We are repurposing 'getAllTasks' or creating a new one. 
    // The plan said "Add getPoolVideos", so let's keep getAllTasks for now if needed for legacy, 
    // but the frontend uses logic to fetch "Active Manual Pool".
    // Let's CHANGE getAllTasks to fetch from VIDEO POOL instead, 
    // as the goal is to manage the POOL, not active tasks directly.

    const videos = await VideoPool.findAll({
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: videos.length,
        tasks: videos // Sending as 'tasks' to match frontend expectation
    });
});

// @desc    Get pool videos explicitly (new endpoint)
// @route   GET /api/tasks/pool
// @access  Private/Admin
exports.getPoolVideos = asyncHandler(async (req, res) => {
    const videos = await VideoPool.findAll({
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: videos.length,
        videos
    });
});

// @desc    Delete video from pool (admin)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = asyncHandler(async (req, res) => {
    // Check VideoPool first
    const video = await VideoPool.findByPk(req.params.id);

    if (video) {
        await video.destroy();
        return res.status(200).json({
            success: true,
            message: 'Video removed from pool successfully'
        });
    }

    // Fallback: Check Task (if we still need to delete active tasks)
    const task = await Task.findByPk(req.params.id);

    if (!task) {
        throw new AppError('Video/Task not found', 404);
    }

    await task.destroy();

    res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
    });
});

// --- YouTube Playlist & Pool Management ---

// @desc    Add a YouTube playlist
// @route   POST /api/tasks/playlists
// @access  Private/Admin
exports.addPlaylist = asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url) {
        throw new AppError('Please provide a playlist URL', 400);
    }

    const playlistID = await ytpl.getPlaylistID(url);
    const details = await ytpl(playlistID, { limit: 1 });

    const playlist = await Playlist.create({
        url,
        title: details.title,
        addedBy: req.user.id
    });

    res.status(201).json({
        success: true,
        message: 'Playlist added successfully',
        playlist
    });
});

// @desc    Get all playlists
// @route   GET /api/tasks/playlists
// @access  Private/Admin
exports.getPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.findAll({
        include: [{ model: User, as: 'addedByUser', attributes: ['phone'] }]
    });
    const videoCount = await VideoPool.count();

    res.status(200).json({
        success: true,
        playlists,
        videoCount
    });
});

// @desc    Delete a playlist and its videos
// @route   DELETE /api/tasks/playlists/:id
// @access  Private/Admin
exports.deletePlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findByPk(req.params.id);
    if (!playlist) {
        throw new AppError('Playlist not found', 404);
    }

    await VideoPool.destroy({ where: { playlist: playlist.id } });
    await playlist.destroy();

    res.status(200).json({
        success: true,
        message: 'Playlist and associated videos removed'
    });
});

// @desc    Sync videos from all active playlists
// @route   POST /api/tasks/playlists/sync
// @access  Private/Admin
exports.syncVideos = asyncHandler(async (req, res) => {
    const playlists = await Playlist.findAll({ where: { status: 'active' } });
    let newVideosCount = 0;

    for (const playlist of playlists) {
        try {
            const playlistID = await ytpl.getPlaylistID(playlist.url);
            const data = await ytpl(playlistID);

            const videos = data.items.map(item => ({
                videoId: item.id,
                title: item.title,
                videoUrl: item.shortUrl,
                playlist: playlist.id
            }));

            for (const video of videos) {
                const [videoRecord, created] = await VideoPool.findOrCreate({
                    where: { videoId: video.videoId },
                    defaults: video
                });
                if (created) newVideosCount++;
            }
        } catch (err) {
            console.error(`Failed to sync playlist ${playlist.id}:`, err.message);
        }
    }

    res.status(200).json({
        success: true,
        message: `Sync complete. Added ${newVideosCount} new videos.`,
        newVideosCount
    });
});
