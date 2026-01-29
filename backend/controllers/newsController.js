const { News, User } = require('../models');
const cloudinary = require('../config/cloudinary');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const upload = require('../middlewares/upload');

// @desc    Get all active news
// @route   GET /api/news
// @access  Public (Optional Auth)
exports.getNews = asyncHandler(async (req, res) => {
    const news = await News.findAll({
        where: { status: 'active' },
        order: [['publishedDate', 'DESC']]
    });

    // If admin, show all
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        return res.status(200).json({ success: true, count: news.length, news });
    }

    // Filter for users/guests
    const filteredNews = news.filter(item => {
        // If no target ranks set, everyone sees it
        if (!item.targetRanks || item.targetRanks.length === 0) return true;
        
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
        if (!item.targetRanks || item.targetRanks.length === 0) return true;
        if (!req.user) return false;
        return item.targetRanks.includes(req.user.membershipLevel);
    });

    res.status(200).json({ success: true, news: matchedNews });
});

// @desc    Create news (admin)
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = [
    upload.single('image'),
    asyncHandler(async (req, res) => {
        const { title, content, publishedDate, targetRanks, showAsPopup } = req.body;
        
        let parsedTargetRanks = null;
        if (targetRanks) {
            try {
                parsedTargetRanks = typeof targetRanks === 'string' ? JSON.parse(targetRanks) : targetRanks;
            } catch (e) {
                // Keep as is if parsing fails or assume it's already an object/array
                parsedTargetRanks = targetRanks;
            }
        }

        const newsData = {
            title,
            content,
            showAsPopup: showAsPopup === 'true' || showAsPopup === true, // handle multipart form data
            targetRanks: parsedTargetRanks,
            createdBy: req.user.id,
            publishedDate: publishedDate || new Date()
        };

        if (req.file) {
            const uploadStream = () => new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'foxriver/news', resource_type: 'image' },
                    (err, result) => err ? reject(err) : resolve(result)
                );
                stream.end(req.file.buffer);
            });
            const result = await uploadStream();
            newsData.imageUrl = result.secure_url;
        }

        const news = await News.create(newsData);
        res.status(201).json({ success: true, message: 'News created', news });
    })
];

// @desc    Update news (admin)
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = asyncHandler(async (req, res) => {
    const news = await News.findByPk(req.params.id);
    if (!news) throw new AppError('News not found', 404);

    const { title, content, status, showAsPopup, targetRanks } = req.body;
    
    if (title) news.title = title;
    if (content) news.content = content;
    if (status) news.status = status;
    if (showAsPopup !== undefined) news.showAsPopup = showAsPopup;
    if (targetRanks !== undefined) news.targetRanks = targetRanks;

    await news.save();
    res.status(200).json({ success: true, message: 'News updated', news });
});

// @desc    Delete news (admin)
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = asyncHandler(async (req, res) => {
    const news = await News.findByPk(req.params.id);
    if (!news) throw new AppError('News not found', 404);

    if (news.imageUrl) {
        try {
            const publicId = `foxriver/news/${news.imageUrl.split('/').pop().split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (e) { console.warn('Cloudinary cleanup failed'); }
    }

    await news.destroy();
    res.status(200).json({ success: true, message: 'News deleted' });
});
