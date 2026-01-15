const { Task, TaskCompletion, User, Membership, Playlist, VideoPool, SystemSetting, sequelize } = require('../models');
const { calculateAndCreateCommissions } = require('../utils/commission');
const { Op } = require('sequelize');
const ytpl = require('ytpl');


// @desc    Get daily tasks for user
// @route   GET /api/tasks/daily
// @access  Private
exports.getDailyTasks = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        // Check if Intern user can earn
        const canInternEarn = user.canInternEarn();
        const internDaysRemaining = user.getInternDaysRemaining();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if today is Sunday (0 = Sunday in JavaScript)
        const isSunday = today.getDay() === 0;

        // Get system settings
        const settings = await SystemSetting.findOne() || {};

        // Check if tasks are disabled by admin
        if (settings.tasksDisabled) {
            const membership = await Membership.findOne({ where: { level: user.membershipLevel } });
            return res.status(200).json({
                success: true,
                count: 0,
                tasks: [],
                dailyIncome: membership && canInternEarn ? membership.getDailyIncome() : 0,
                perVideoIncome: membership && canInternEarn ? membership.getPerVideoIncome() : 0,
                earningsStats: {
                    todayEarnings: 0,
                    completedTasks: 0,
                    remainingTasks: 0,
                    totalPossibleEarnings: 0
                },
                isTasksDisabled: true,
                message: 'Tasks are currently disabled by the administrator. Please check back later.',
                internRestriction: user.membershipLevel === 'Intern' ? {
                    canEarn: canInternEarn,
                    daysRemaining: internDaysRemaining,
                    activatedAt: user.membershipActivatedAt || user.createdAt
                } : null
            });
        }

        // If it's Sunday, return empty tasks with a message
        if (isSunday) {
            const membership = await Membership.findOne({ where: { level: user.membershipLevel } });

            return res.status(200).json({
                success: true,
                count: 0,
                tasks: [],
                dailyIncome: membership && canInternEarn ? membership.getDailyIncome() : 0,
                perVideoIncome: membership && canInternEarn ? membership.getPerVideoIncome() : 0,
                earningsStats: {
                    todayEarnings: 0,
                    completedTasks: 0,
                    remainingTasks: 0,
                    totalPossibleEarnings: 0
                },
                isSunday: true,
                message: 'Tasks are not available on Sundays. Come back tomorrow!',
                internRestriction: user.membershipLevel === 'Intern' ? {
                    canEarn: canInternEarn,
                    daysRemaining: internDaysRemaining,
                    activatedAt: user.membershipActivatedAt || user.createdAt
                } : null
            });
        }

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get tasks for today (created today)
        let tasks = await Task.findAll({
            where: {
                createdAt: { [Op.gte]: today, [Op.lt]: tomorrow },
                status: 'active'
            }
        });

        // If no tasks for today, try to generate from VideoPool
        if (tasks.length === 0) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // Fetch 4 videos from pool that weren't used yesterday (if possible)
            // Strategy: Randomize and pick 4. If we have enough videos, filter out yesterday's.
            let availableVideos = await VideoPool.findAll({
                where: {
                    [Op.or]: [
                        { lastUsed: { [Op.lt]: yesterday } }, // Used before yesterday
                        { lastUsed: null } // Never used
                    ]
                }
            });

            // If we don't have enough that weren't used yesterday, just get anything not used today
            if (availableVideos.length < 4) {
                availableVideos = await VideoPool.findAll({
                    where: {
                        [Op.or]: [
                            { lastUsed: { [Op.lt]: today } }, // Used before today
                            { lastUsed: null } // Never used
                        ]
                    }
                });
            }

            // Shuffle available videos
            availableVideos = availableVideos.sort(() => 0.5 - Math.random());
            const selectedVideos = availableVideos.slice(0, 4);

            if (selectedVideos.length > 0) {
                // Create tasks for selected videos
                const newTasks = selectedVideos.map(v => ({
                    videoUrl: v.videoUrl,
                    title: v.title,
                    status: 'active'
                }));

                tasks = await Task.bulkCreate(newTasks);

                // Update lastUsed for these videos
                await VideoPool.update(
                    { lastUsed: today },
                    { where: { id: { [Op.in]: selectedVideos.map(v => v.id) } } }
                );
            }
        }

        // Limit to 4 (should already be 4 or less)
        tasks = tasks.slice(0, 4);

        // Get user's membership to calculate earnings
        const membership = await Membership.findOne({ where: { level: user.membershipLevel } });

        // Check which tasks user has completed
        const completedTasks = await TaskCompletion.findAll({
            where: {
                user: req.user.id,
                task: { [Op.in]: tasks.map(t => t.id) }
            },
            attributes: ['task']
        });
        const completedTaskIds = completedTasks.map(ct => ct.task);

        // Format tasks with earnings and completion status
        // For Interns who can't earn, set earnings to 0
        const tasksWithDetails = tasks.map(task => ({
            ...task.toJSON(),
            earnings: (membership && canInternEarn) ? membership.getPerVideoIncome() : 0,
            isCompleted: completedTaskIds.includes(task.id),
            canEarn: canInternEarn
        }));

        // Calculate earnings summary
        const completedCount = tasksWithDetails.filter(task => task.isCompleted).length;
        const todayEarnings = completedCount * (membership && canInternEarn ? membership.getPerVideoIncome() : 0);
        const totalPossibleEarnings = tasksWithDetails.length * (membership && canInternEarn ? membership.getPerVideoIncome() : 0);

        res.status(200).json({
            success: true,
            count: tasksWithDetails.length,
            tasks: tasksWithDetails,
            dailyIncome: membership && canInternEarn ? membership.getDailyIncome() : 0,
            perVideoIncome: membership && canInternEarn ? membership.getPerVideoIncome() : 0,
            earningsStats: {
                todayEarnings,
                completedTasks: completedCount,
                remainingTasks: tasksWithDetails.length - completedCount,
                totalPossibleEarnings
            },
            internRestriction: user.membershipLevel === 'Intern' ? {
                canEarn: canInternEarn,
                daysRemaining: internDaysRemaining,
                activatedAt: user.membershipActivatedAt || user.createdAt
            } : null
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
        // Check if today is Sunday
        const today = new Date();
        const isSunday = today.getDay() === 0;

        // Get system settings
        const settings = await SystemSetting.findOne() || {};

        if (settings.tasksDisabled) {
            return res.status(400).json({
                success: false,
                message: 'Tasks are currently disabled by the administrator. Please check back later.'
            });
        }

        if (isSunday) {
            return res.status(400).json({
                success: false,
                message: 'Tasks cannot be completed on Sundays. Please come back tomorrow!'
            });
        }

        const task = await Task.findByPk(req.params.id);

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
            where: {
                user: req.user.id,
                task: task.id
            }
        });

        if (existingCompletion) {
            return res.status(400).json({
                success: false,
                message: 'You have already completed this task'
            });
        }

        // Get user's membership to calculate earnings
        const user = await User.findByPk(req.user.id);
        const membership = await Membership.findOne({ where: { level: user.membershipLevel } });

        if (!membership) {
            return res.status(400).json({
                success: false,
                message: 'Membership level not found'
            });
        }

        // Check if Intern user can earn (within 4-day window)
        if (user.membershipLevel === 'Intern' && !user.canInternEarn()) {
            return res.status(403).json({
                success: false,
                message: 'Your Intern trial period has ended. Task earning is no longer available. Please upgrade to Rank 1 to continue earning.',
                code: 'INTERN_TRIAL_EXPIRED'
            });
        }

        // Calculate earnings
        let earningsAmount = membership.getPerVideoIncome();

        // Cap Intern earnings: 50 ETB daily, 200 ETB total lifetime
        if (user.membershipLevel === 'Intern') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Fetch total lifetime earnings for this Intern
            const allTimeEarnings = await TaskCompletion.findOne({
                where: { user: user.id },
                attributes: [[sequelize.fn('SUM', sequelize.col('earningsAmount')), 'total']],
                raw: true
            });

            const lifetimeTotal = allTimeEarnings?.total || 0;

            if (lifetimeTotal >= 200) {
                return res.status(400).json({
                    success: false,
                    message: 'Your Intern trial has completed (Total 200 ETB limit reached). Please upgrade to Rank 1.'
                });
            }

            // Fetch today's earnings
            const todayEarnings = await TaskCompletion.findOne({
                where: {
                    user: user.id,
                    completionDate: { [Op.gte]: today }
                },
                attributes: [[sequelize.fn('SUM', sequelize.col('earningsAmount')), 'total']],
                raw: true
            });

            const currentDailyTotal = todayEarnings?.total || 0;

            if (currentDailyTotal >= 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Daily earning limit reached (50 ETB for Intern level)'
                });
            }

            // Ensure earnings don't exceed daily or lifetime limits
            earningsAmount = Math.min(earningsAmount, 50 - currentDailyTotal, 200 - lifetimeTotal);
        }

        // Create task completion record
        const completion = await TaskCompletion.create({
            user: req.user.id,
            task: task.id,
            earningsAmount
        });

        // Credit earnings to user's income balance atomically
        const updatedUser = await User.findByPk(req.user.id);
        updatedUser.incomeWallet = parseFloat(updatedUser.incomeWallet) + earningsAmount;
        await updatedUser.save();

        // Calculate and credit referral commissions
        await calculateAndCreateCommissions(completion, earningsAmount);

        res.status(200).json({
            success: true,
            message: 'Task completed successfully',
            completion,
            earningsAmount,
            newWalletBalance: updatedUser.incomeWallet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Upload task YouTube URL (admin)
// @route   POST /api/tasks/upload
// @access  Private/Admin
exports.uploadTask = async (req, res) => {
    try {
        const { youtubeUrl, title } = req.body;

        if (!youtubeUrl) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a YouTube URL'
            });
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all tasks (admin)
// @route   GET /api/tasks/all
// @access  Private/Admin
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.findAll({
            include: [{ model: User, as: 'uploader', attributes: ['phone'] }],
            order: [['createdAt', 'DESC']]
        });

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
        const task = await Task.findByPk(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.destroy();

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
        const playlists = await Playlist.findAll({
            include: [{ model: User, as: 'addedByUser', attributes: ['phone'] }]
        });
        const videoCount = await VideoPool.count();

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
        const playlist = await Playlist.findByPk(req.params.id);
        if (!playlist) {
            return res.status(404).json({ success: false, message: 'Playlist not found' });
        }

        // Delete videos associated with this playlist
        await VideoPool.destroy({ where: { playlist: playlist.id } });
        await playlist.destroy();

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
        const playlists = await Playlist.findAll({ where: { status: 'active' } });
        let newVideosCount = 0;

        for (const playlist of playlists) {
            const playlistID = await ytpl.getPlaylistID(playlist.url);
            const data = await ytpl(playlistID);

            const videos = data.items.map(item => ({
                videoId: item.id,
                title: item.title,
                videoUrl: item.shortUrl,
                playlist: playlist.id
            }));

            // Bulk upsert to avoid duplicates
            for (const video of videos) {
                const [videoRecord, created] = await VideoPool.findOrCreate({
                    where: { videoId: video.videoId },
                    defaults: video
                });
                if (created) newVideosCount++;
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
