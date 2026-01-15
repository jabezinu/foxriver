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

// @desc    Upload task YouTube URL (admin)
// @route   POST /api/tasks/upload
// @access  Private/Admin
exports.uploadTask = asyncHandler(async (req, res) => {
    const { youtubeUrl, title } = req.body;

    if (!youtubeUrl) {
        throw new AppError('Please provide a YouTube URL', 400);
    }

    const task = await Task.create({
        videoUrl: youtubeUrl,
        title: title || 'YouTube Video Task',
        uploadedBy: req.user.id
    });

    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task
    });
});

// @desc    Get all tasks (admin)
// @route   GET /api/tasks/all
// @access  Private/Admin
exports.getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.findAll({
        include: [{ model: User, as: 'uploader', attributes: ['phone'] }],
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: tasks.length,
        tasks
    });
});

// @desc    Delete task (admin)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
        throw new AppError('Task not found', 404);
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
