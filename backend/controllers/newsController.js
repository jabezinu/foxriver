const { News, User } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get all active news
// @route   GET /api/news
// @access  Public (Optional Auth)
exports.getNews = asyncHandler(async (req, res) => {
    const news = await News.findAll({
        order: [['publishedDate', 'DESC']]
    });

    // If admin, show all (including inactive)
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        return res.status(200).json({ success: true, count: news.length, news });
    }

    // Filter for users/guests (only active news)
    const activeNews = news.filter(n => n.status === 'active');
    
    const filteredNews = activeNews.filter(item => {
        // If no target ranks set, everyone sees it
        if (!item.targetRanks || (Array.isArray(item.targetRanks) && item.targetRanks.length === 0)) return true;
        
        // If guest (no user), only see public news (no target ranks)
        if (!req.user) return false;

        // If user logged in, check if their rank is in target
        return item.targetRanks.includes(req.user.membershipLevel);
    });

    res.status(200).json({ success: true, count: filteredNews.length, news: filteredNews });
});

// @desc    Get latest popup news
// @route   GET /api/news/popup
// @access  Public (Optional Auth)
exports.getPopupNews = asyncHandler(async (req, res) => {
    // Fetch all active popups
    const newsList = await News.findAll({
        where: { status: 'active', showAsPopup: true },
        order: [['publishedDate', 'DESC']]
    });

    // Filter matching ones
    const matchedNews = newsList.filter(item => {
        if (!item.targetRanks || (Array.isArray(item.targetRanks) && item.targetRanks.length === 0)) return true;
        if (!req.user) return false;
        return item.targetRanks.includes(req.user.membershipLevel);
    });

    res.status(200).json({ success: true, news: matchedNews });
});

// @desc    Create news (admin)
// @route   POST /api/news
// @access  Private/Admin
// @desc    Create news (admin)
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = asyncHandler(async (req, res) => {
    const { title, content, publishedDate, targetRanks, showAsPopup } = req.body;
    
    let parsedTargetRanks = null;
    if (targetRanks) {
        try {
            parsedTargetRanks = typeof targetRanks === 'string' ? JSON.parse(targetRanks) : targetRanks;
        } catch (e) {
            parsedTargetRanks = targetRanks;
        }
    }

    const newsData = {
        title,
        content,
        showAsPopup: showAsPopup === 'true' || showAsPopup === true,
        targetRanks: parsedTargetRanks,
        createdBy: req.user.id,
        publishedDate: publishedDate || new Date()
    };

    const news = await News.create(newsData);
    res.status(201).json({ success: true, message: 'News created', news });
});

// @desc    Update news (admin)
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = asyncHandler(async (req, res) => {
    const news = await News.findByPk(req.params.id);
    if (!news) throw new AppError('News not found', 404);

    const { title, content, status, showAsPopup, targetRanks, publishedDate } = req.body;
    
    if (title) news.title = title;
    if (content) news.content = content;
    if (status) news.status = status;
    if (showAsPopup !== undefined) news.showAsPopup = showAsPopup === 'true' || showAsPopup === true;
    if (publishedDate) news.publishedDate = publishedDate;

    if (targetRanks !== undefined) {
        try {
            news.targetRanks = typeof targetRanks === 'string' ? JSON.parse(targetRanks) : targetRanks;
        } catch (e) {
            news.targetRanks = targetRanks;
        }
    }

    await news.save();
    res.status(200).json({ success: true, message: 'News updated', news });
});

// @desc    Delete news (admin)
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = asyncHandler(async (req, res) => {
    const news = await News.findByPk(req.params.id);
    if (!news) throw new AppError('News not found', 404);

    await news.destroy();
    res.status(200).json({ success: true, message: 'News deleted' });
});
