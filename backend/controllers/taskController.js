const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Playlist = require('../models/Playlist');
const VideoPool = require('../models/VideoPool');
const { calculateAndCreateCommissions } = require('../utils/commission');
const multer = require('multer');
const path = require('path');
const ytpl = require('ytpl');

// Configure multer for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/videos');
    },
    filename: function (req, file, cb) {
        cb(null, `video-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50000000 }, // 50MB
    fileFilter: function (req, file, cb) {
        const filetypes = /mp4|mov|avi|mkv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = /video/.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// @desc    Get daily tasks for user
// @route   GET /api/tasks/daily
// @access  Private
exports.getDailyTasks = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get tasks for today
        let tasks = await Task.find({
            dailySet: { $gte: today, $lt: tomorrow },
            status: 'active'
        });

        // If no tasks for today, try to generate from VideoPool
        if (tasks.length === 0) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // Fetch 5 videos from pool that weren't used yesterday (if possible)
            // Strategy: Randomize and pick 5. If we have enough videos, filter out yesterday's.
            let availableVideos = await VideoPool.find({
                $or: [
                    { lastUsed: { $lt: today, $ne: yesterday } },
                    { lastUsed: null }
                ]
            });

            // If we don't have enough that weren't used yesterday, just get anything but today (which should be none anyway)
            if (availableVideos.length < 5) {
                availableVideos = await VideoPool.find({
                    $or: [
                        { lastUsed: { $lt: today } },
                        { lastUsed: null }
                    ]
                });
            }

            // Shuffle available videos
            availableVideos = availableVideos.sort(() => 0.5 - Math.random());
            const selectedVideos = availableVideos.slice(0, 5);

            if (selectedVideos.length > 0) {
                // Create tasks for selected videos
                const newTasks = selectedVideos.map(v => ({
                    videoUrl: v.videoUrl,
                    title: v.title,
                    dailySet: today,
                    status: 'active'
                }));

                tasks = await Task.insertMany(newTasks);

                // Update lastUsed for these videos
                await VideoPool.updateMany(
                    { _id: { $in: selectedVideos.map(v => v._id) } },
                    { $set: { lastUsed: today } }
                );
            }
        }

        // Limit to 5 (should already be 5 or less)
        tasks = tasks.slice(0, 5);

        // Get user's membership to calculate earnings
        const user = await User.findById(req.user.id);
        const membership = await Membership.findOne({ level: user.membershipLevel });

        // Check which tasks user has completed
        const completedTaskIds = await TaskCompletion.find({
            user: req.user.id,
            task: { $in: tasks.map(t => t._id) }
        }).distinct('task');

        // Format tasks with earnings and completion status
        const tasksWithDetails = tasks.map(task => ({
            ...task.toObject(),
            earnings: membership ? membership.getPerVideoIncome() : 0,
            isCompleted: completedTaskIds.some(id => id.toString() === task._id.toString())
        }));

        res.status(200).json({
            success: true,
            count: tasksWithDetails.length,
            tasks: tasksWithDetails,
            dailyIncome: membership ? membership.getDailyIncome() : 0,
            perVideoIncome: membership ? membership.getPerVideoIncome() : 0
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Complete a task
// @route   POST /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if task is active
        if (task.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This task is not active'
            });
        }

        // Check if user already completed this task
        const existingCompletion = await TaskCompletion.findOne({
            user: req.user.id,
            task: task._id
        });

        if (existingCompletion) {
            return res.status(400).json({
                success: false,
                message: 'You have already completed this task'
            });
        }

        // Get user's membership to calculate earnings
        const user = await User.findById(req.user.id);
        const membership = await Membership.findOne({ level: user.membershipLevel });

        if (!membership) {
            return res.status(400).json({
                success: false,
                message: 'Membership level not found'
            });
        }

        // Calculate earnings
        let earningsAmount = membership.getPerVideoIncome();

        // Cap Intern earnings at 50 ETB per day
        if (user.membershipLevel === 'Intern') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayEarnings = await TaskCompletion.aggregate([
                {
                    $match: {
                        user: user._id,
                        completionDate: { $gte: today }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$earningsAmount' }
                    }
                }
            ]);

            const currentDailyTotal = todayEarnings.length > 0 ? todayEarnings[0].total : 0;

            if (currentDailyTotal >= 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Daily earning limit reached (50 ETB for Intern level)'
                });
            }

            // Ensure earnings don't exceed daily limit
            earningsAmount = Math.min(earningsAmount, 50 - currentDailyTotal);
        }

        // Create task completion record
        const completion = await TaskCompletion.create({
            user: req.user.id,
            task: task._id,
            earningsAmount
        });

        // Credit earnings to user's income wallet
        user.incomeWallet += earningsAmount;
        await user.save();

        // Calculate and credit referral commissions
        await calculateAndCreateCommissions(completion, earningsAmount);

        res.status(200).json({
            success: true,
            message: 'Task completed successfully',
            completion,
            earningsAmount,
            newWalletBalance: user.incomeWallet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Upload task video or YouTube URL (admin)
// @route   POST /api/tasks/upload
// @access  Private/Admin
exports.uploadTask = [
    upload.single('video'),
    async (req, res) => {
        try {
            const { dailySet, youtubeUrl, title } = req.body;

            if (!dailySet) {
                return res.status(400).json({
                    success: false,
                    message: 'Please specify the daily set date'
                });
            }

            let videoUrl = '';

            if (req.file) {
                videoUrl = `/uploads/videos/${req.file.filename}`;
            } else if (youtubeUrl) {
                videoUrl = youtubeUrl;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a video file or provide a YouTube URL'
                });
            }

            const task = await Task.create({
                videoUrl,
                title: title || (youtubeUrl ? 'YouTube Video Task' : 'Uploaded Video Task'),
                dailySet: new Date(dailySet),
                uploadedBy: req.user.id
            });

            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                task
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Server error'
            });
        }
    }
];

// @desc    Get all tasks (admin)
// @route   GET /api/tasks/all
// @access  Private/Admin
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find()
            .populate('uploadedBy', 'phone')
            .sort({ dailySet: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete task (admin)
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// --- YouTube Playlist & Pool Management ---

// @desc    Add a YouTube playlist
// @route   POST /api/tasks/playlists
// @access  Private/Admin
exports.addPlaylist = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, message: 'Please provide a playlist URL' });
        }

        // Validate playlist ID
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
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all playlists
// @route   GET /api/tasks/playlists
// @access  Private/Admin
exports.getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('addedBy', 'phone');
        const videoCount = await VideoPool.countDocuments();

        res.status(200).json({
            success: true,
            playlists,
            videoCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a playlist and its videos
// @route   DELETE /api/tasks/playlists/:id
// @access  Private/Admin
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Delete videos associated with this playlist
        await VideoPool.deleteMany({ playlist: playlist._id });
        await playlist.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Playlist and associated videos removed'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Sync videos from all active playlists
// @route   POST /api/tasks/playlists/sync
// @access  Private/Admin
exports.syncVideos = async (req, res) => {
    try {
        const playlists = await Playlist.find({ status: 'active' });
        let newVideosCount = 0;

        for (const playlist of playlists) {
            const playlistID = await ytpl.getPlaylistID(playlist.url);
            const data = await ytpl(playlistID);

            const videos = data.items.map(item => ({
                videoId: item.id,
                title: item.title,
                videoUrl: item.shortUrl,
                playlist: playlist._id
            }));

            // Bulk upsert to avoid duplicates
            for (const video of videos) {
                const result = await VideoPool.updateOne(
                    { videoId: video.videoId },
                    { $set: video },
                    { upsert: true }
                );
                if (result.upsertedCount > 0) newVideosCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Sync complete. Added ${newVideosCount} new videos to the pool.`,
            newVideosCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
