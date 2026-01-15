const { VideoPool, DailyVideoAssignment, SystemSetting, User, sequelize } = require('../models');
const { calculateAndCreateCommissions } = require('../utils/commission');
const { Op } = require('sequelize');

// @desc    Get daily video tasks for user
// @route   GET /api/video-tasks/daily
// @access  Private
exports.getDailyVideoTasks = async (req, res) => {
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
            return res.status(200).json({
                success: true,
                message: 'Tasks are currently disabled by the administrator. Please check back later.',
                videos: [],
                totalEarnings: 0,
                perVideoEarning: 0,
                isSunday: false,
                isTasksDisabled: true
            });
        }

        // If it's Sunday, return empty tasks
        if (isSunday) {
            return res.status(200).json({
                success: true,
                message: 'Tasks are not available on Sundays. Come back tomorrow!',
                videos: [],
                totalEarnings: 0,
                perVideoEarning: 0,
                isSunday: true
            });
        }

        const videoWatchTimeRequired = settings.videoWatchTimeRequired || 8;
        const videoPaymentAmount = settings.videoPaymentAmount || 10;
        const videosPerDay = settings.videosPerDay || 4;

        // Check if user already has assignment for today
        let assignment = await DailyVideoAssignment.findOne({
            where: {
                user: req.user.id,
                assignmentDate: today
            },
            include: [{ model: VideoPool, as: 'videos' }]
        });

        // If no assignment exists, create one
        if (!assignment) {
            // Get videos that weren't used yesterday for this user
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const yesterdayAssignment = await DailyVideoAssignment.findOne({
                where: {
                    user: req.user.id,
                    assignmentDate: yesterday
                }
            });

            const excludeVideoIds = yesterdayAssignment ?
                yesterdayAssignment.videos.map(v => v.video) : [];

            // Get available videos (excluding yesterday's videos if possible)
            let availableVideos = await VideoPool.findAll({
                where: {
                    id: { [Op.notIn]: excludeVideoIds }
                }
            });

            // If we don't have enough videos excluding yesterday's, include all videos
            if (availableVideos.length < videosPerDay) {
                availableVideos = await VideoPool.findAll({});
            }

            // Randomly select videos
            const shuffled = availableVideos.sort(() => 0.5 - Math.random());
            const selectedVideos = shuffled.slice(0, videosPerDay);

            if (selectedVideos.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No videos available today',
                    videos: [],
                    totalEarnings: 0,
                    perVideoEarning: canInternEarn ? videoPaymentAmount : 0,
                    watchTimeRequired: videoWatchTimeRequired,
                    internRestriction: user.membershipLevel === 'Intern' ? {
                        canEarn: canInternEarn,
                        daysRemaining: internDaysRemaining,
                        activatedAt: user.membershipActivatedAt || user.createdAt
                    } : null
                });
            }

            // Create assignment
            assignment = await DailyVideoAssignment.create({
                user: req.user.id,
                assignmentDate: today,
                videos: selectedVideos.map(video => ({
                    video: video.id,
                    watchedSeconds: 0,
                    isCompleted: false,
                    rewardAmount: canInternEarn ? videoPaymentAmount : 0
                }))
            });

            // Populate the videos
            assignment = await DailyVideoAssignment.findByPk(assignment.id, {
                include: [{ model: VideoPool, as: 'videos' }]
            });
        }

        // Format response
        const videos = assignment.videos.map(videoAssignment => ({
            _id: videoAssignment._id,
            videoId: videoAssignment.video.videoId,
            title: videoAssignment.video.title,
            videoUrl: videoAssignment.video.videoUrl,
            watchedSeconds: videoAssignment.watchedSeconds,
            isCompleted: videoAssignment.isCompleted,
            rewardAmount: canInternEarn ? videoAssignment.rewardAmount : 0,
            completedAt: videoAssignment.completedAt,
            canEarn: canInternEarn
        }));

        const completedCount = videos.filter(v => v.isCompleted).length;
        const totalEarnings = completedCount * (canInternEarn ? videoPaymentAmount : 0);

        res.status(200).json({
            success: true,
            videos,
            totalEarnings,
            perVideoEarning: canInternEarn ? videoPaymentAmount : 0,
            watchTimeRequired: videoWatchTimeRequired,
            completedCount,
            totalVideos: videos.length,
            internRestriction: user.membershipLevel === 'Intern' ? {
                canEarn: canInternEarn,
                daysRemaining: internDaysRemaining,
                activatedAt: user.membershipActivatedAt || user.createdAt
            } : null
        });

    } catch (error) {
        console.error('Error in getDailyVideoTasks:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update video watch progress
// @route   POST /api/video-tasks/:videoAssignmentId/progress
// @access  Private
exports.updateVideoProgress = async (req, res) => {
    try {
        const { videoAssignmentId } = req.params;
        const { watchedSeconds } = req.body;

        if (!watchedSeconds || watchedSeconds < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid watched seconds'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the assignment
        const assignment = await DailyVideoAssignment.findOne({
            user: req.user.id,
            assignmentDate: today,
            'videos._id': videoAssignmentId
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Video assignment not found'
            });
        }

        // Find the specific video in the assignment
        const videoIndex = assignment.videos.findIndex(
            v => v._id.toString() === videoAssignmentId
        );

        if (videoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Video not found in assignment'
            });
        }

        // Update watched seconds (only if not completed)
        if (!assignment.videos[videoIndex].isCompleted) {
            assignment.videos[videoIndex].watchedSeconds = Math.max(
                assignment.videos[videoIndex].watchedSeconds,
                watchedSeconds
            );
            await assignment.save();
        }

        res.status(200).json({
            success: true,
            watchedSeconds: assignment.videos[videoIndex].watchedSeconds,
            isCompleted: assignment.videos[videoIndex].isCompleted
        });

    } catch (error) {
        console.error('Error in updateVideoProgress:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Complete video task
// @route   POST /api/video-tasks/:videoAssignmentId/complete
// @access  Private
exports.completeVideoTask = async (req, res) => {
    try {
        const { videoAssignmentId } = req.params;
        const { watchedSeconds } = req.body;

        // Get user and check Intern restriction
        const user = await User.findByPk(req.user.id);

        // Check if Intern user can earn (within 4-day window)
        if (user.membershipLevel === 'Intern' && !user.canInternEarn()) {
            return res.status(403).json({
                success: false,
                message: 'Your Intern trial period has ended. Video task earning is no longer available. Please upgrade to Rank 1 to continue earning.',
                code: 'INTERN_TRIAL_EXPIRED'
            });
        }

        // Get system settings
        const settings = await SystemSetting.findOne() || {};

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if today is Sunday
        const isSunday = today.getDay() === 0;

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

        const videoWatchTimeRequired = settings.videoWatchTimeRequired || 8;
        const videoPaymentAmount = settings.videoPaymentAmount || 10;

        if (!watchedSeconds || watchedSeconds < videoWatchTimeRequired) {
            return res.status(400).json({
                success: false,
                message: `You must watch the video for at least ${videoWatchTimeRequired} seconds`
            });
        }

        // Find the assignment
        const assignment = await DailyVideoAssignment.findOne({
            user: req.user.id,
            assignmentDate: today,
            'videos._id': videoAssignmentId
        });

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Video assignment not found'
            });
        }

        // Find the specific video in the assignment
        const videoIndex = assignment.videos.findIndex(
            v => v._id.toString() === videoAssignmentId
        );

        if (videoIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Video not found in assignment'
            });
        }

        const videoAssignment = assignment.videos[videoIndex];

        // Check if already completed
        if (videoAssignment.isCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Video already completed'
            });
        }

        // Mark as completed
        assignment.videos[videoIndex].isCompleted = true;
        assignment.videos[videoIndex].completedAt = new Date();
        assignment.videos[videoIndex].watchedSeconds = watchedSeconds;
        assignment.videos[videoIndex].rewardAmount = videoPaymentAmount;

        await assignment.save();

        // Credit user's wallet
        const updatedUser = await User.findByPk(req.user.id);
        updatedUser.incomeWallet = parseFloat(updatedUser.incomeWallet) + videoPaymentAmount;
        await updatedUser.save();

        // Create a mock task completion for commission calculation
        const mockCompletion = {
            user: req.user.id,
            earningsAmount: videoPaymentAmount,
            completionDate: new Date()
        };

        // Calculate and credit referral commissions
        await calculateAndCreateCommissions(mockCompletion, videoPaymentAmount);

        res.status(200).json({
            success: true,
            message: 'Video completed successfully!',
            earningsAmount: videoPaymentAmount,
            newWalletBalance: updatedUser.incomeWallet,
            watchedSeconds: watchedSeconds
        });

    } catch (error) {
        console.error('Error in completeVideoTask:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get video task statistics
// @route   GET /api/video-tasks/stats
// @access  Private
exports.getVideoTaskStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const assignment = await DailyVideoAssignment.findOne({
            where: {
                user: req.user.id,
                assignmentDate: today
            }
        });

        const settings = await SystemSetting.findOne() || {};
        const videoPaymentAmount = settings.videoPaymentAmount || 10;
        const videosPerDay = settings.videosPerDay || 4;

        let completedCount = 0;
        let totalEarnings = 0;

        if (assignment) {
            completedCount = assignment.videos.filter(v => v.isCompleted).length;
            totalEarnings = completedCount * videoPaymentAmount;
        }

        res.status(200).json({
            success: true,
            completedCount,
            totalVideos: videosPerDay,
            totalEarnings,
            perVideoEarning: videoPaymentAmount,
            dailyPotential: videosPerDay * videoPaymentAmount
        });

    } catch (error) {
        console.error('Error in getVideoTaskStats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};