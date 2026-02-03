const { VideoPool, DailyVideoAssignment, SystemSetting, User, sequelize } = require('../models');
const { calculateAndCreateCommissions } = require('../utils/commission');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get daily video tasks for user
// @route   GET /api/video-tasks/daily
// @access  Private
exports.getDailyVideoTasks = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    const canInternEarn = user.canInternEarn();
    const internDaysRemaining = user.getInternDaysRemaining();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isSunday = today.getDay() === 0;
    const settings = await SystemSetting.findOne() || {};

    if (settings.tasksDisabled) {
        return res.status(200).json({
            success: true,
            message: 'Tasks are currently disabled by the administrator.',
            videos: [],
            totalEarnings: 0,
            perVideoEarning: 0,
            isSunday: false,
            isTasksDisabled: true
        });
    }

    if (isSunday) {
        return res.status(200).json({
            success: true,
            message: 'Tasks are not available on Sundays.',
            videos: [],
            totalEarnings: 0,
            perVideoEarning: 0,
            isSunday: true
        });
    }

    const videoWatchTimeRequired = settings.videoWatchTimeRequired || 8;
    const videoPaymentAmount = settings.videoPaymentAmount || 10;
    const videosPerDay = settings.videosPerDay || 4;

    let assignment = await DailyVideoAssignment.findOne({
        where: { user: req.user.id, assignmentDate: today },
        include: [{ model: VideoPool, as: 'videos' }]
    });

    if (!assignment) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayAssignment = await DailyVideoAssignment.findOne({
            where: { user: req.user.id, assignmentDate: yesterday }
        });

        const excludeVideoIds = yesterdayAssignment ? (yesterdayAssignment.videos || []).map(v => v.video) : [];

        let availableVideos = await VideoPool.findAll({ where: { id: { [Op.notIn]: excludeVideoIds } } });
        if (availableVideos.length < videosPerDay) {
            availableVideos = await VideoPool.findAll({});
        }

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

        assignment = await DailyVideoAssignment.findByPk(assignment.id, {
            include: [{ model: VideoPool, as: 'videos' }]
        });
    }

    const videos = (assignment.videos || []).map(va => ({
        _id: va._id,
        videoId: va.video.videoId,
        title: va.video.title,
        videoUrl: va.video.videoUrl,
        watchedSeconds: va.watchedSeconds,
        isCompleted: va.isCompleted,
        rewardAmount: canInternEarn ? va.rewardAmount : 0,
        completedAt: va.completedAt,
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
});

// @desc    Update video watch progress
// @route   POST /api/video-tasks/:videoAssignmentId/progress
// @access  Private
exports.updateVideoProgress = asyncHandler(async (req, res) => {
    const { videoAssignmentId } = req.params;
    const { watchedSeconds } = req.body;

    if (!watchedSeconds || watchedSeconds < 0) throw new AppError('Invalid watched seconds', 400);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const assignment = await DailyVideoAssignment.findOne({
        where: { user: req.user.id, assignmentDate: today }
    });

    if (!assignment) throw new AppError('Assignment not found', 404);

    const videos = Array.isArray(assignment.videos) ? [...assignment.videos] : [];
    const videoIndex = videos.findIndex(v => v._id.toString() === videoAssignmentId);

    if (videoIndex === -1) throw new AppError('Video not found', 404);

    if (!videos[videoIndex].isCompleted) {
        videos[videoIndex].watchedSeconds = Math.max(videos[videoIndex].watchedSeconds, watchedSeconds);
        assignment.videos = videos;
        await assignment.save();
    }

    res.status(200).json({
        success: true,
        watchedSeconds: videos[videoIndex].watchedSeconds,
        isCompleted: videos[videoIndex].isCompleted
    });
});

// @desc    Complete video task
// @route   POST /api/video-tasks/:videoAssignmentId/complete
// @access  Private
exports.completeVideoTask = asyncHandler(async (req, res) => {
    const { videoAssignmentId } = req.params;
    const { watchedSeconds } = req.body;

    const user = await User.findByPk(req.user.id);
    if (user.membershipLevel === 'Intern' && !user.canInternEarn()) {
        throw new AppError('Intern trial period ended', 403);
    }

    const settings = await SystemSetting.findOne() || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (settings.tasksDisabled) throw new AppError('Tasks disabled', 400);
    if (today.getDay() === 0) throw new AppError('No tasks on Sundays', 400);

    const watchRequired = settings.videoWatchTimeRequired || 8;
    const reward = settings.videoPaymentAmount || 10;

    if (!watchedSeconds || watchedSeconds < watchRequired) {
        throw new AppError(`Watch at least ${watchRequired} seconds`, 400);
    }

    const assignment = await DailyVideoAssignment.findOne({
        where: { user: req.user.id, assignmentDate: today }
    });

    if (!assignment) throw new AppError('Assignment not found', 404);

    const videos = Array.isArray(assignment.videos) ? [...assignment.videos] : [];
    const videoIndex = videos.findIndex(v => v._id.toString() === videoAssignmentId);

    if (videoIndex === -1) throw new AppError('Video not found', 404);
    if (videos[videoIndex].isCompleted) throw new AppError('Already completed', 400);

    await sequelize.transaction(async (t) => {
        videos[videoIndex].isCompleted = true;
        videos[videoIndex].completedAt = new Date();
        videos[videoIndex].watchedSeconds = watchedSeconds;
        videos[videoIndex].rewardAmount = reward;

        assignment.videos = videos;
        await assignment.save({ transaction: t });

        const walletField = `${settings.taskWallet || 'income'}Wallet`;
        user[walletField] = parseFloat(user[walletField]) + reward;
        await user.save({ transaction: t });

        const mockCompletion = { user: user.id, earningsAmount: reward, createdAt: new Date() };
        await calculateAndCreateCommissions(mockCompletion, reward);
    });

    res.status(200).json({
        success: true,
        message: 'Completed!',
        earningsAmount: reward,
        newWalletBalance: user.incomeWallet,
        watchedSeconds
    });
});

// @desc    Get video task statistics
// @route   GET /api/video-tasks/stats
// @access  Private
exports.getVideoTaskStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const assignment = await DailyVideoAssignment.findOne({
        where: { user: req.user.id, assignmentDate: today }
    });

    const settings = await SystemSetting.findOne() || {};
    const reward = settings.videoPaymentAmount || 10;
    const perDay = settings.videosPerDay || 4;

    let completed = 0;
    if (assignment && Array.isArray(assignment.videos)) {
        completed = assignment.videos.filter(v => v.isCompleted).length;
    }

    res.status(200).json({
        success: true,
        completedCount: completed,
        totalVideos: perDay,
        totalEarnings: completed * reward,
        perVideoEarning: reward,
        dailyPotential: perDay * reward
    });
});
