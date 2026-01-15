const { News, User } = require('../models');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/news');
    },
    filename: function (req, file, cb) {
        cb(null, `news-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// @desc    Get all active news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
    try {
        const news = await News.findAll({
            where: { status: 'active' },
            order: [['publishedDate', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: news.length,
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get latest popup news
// @route   GET /api/news/popup
// @access  Public
exports.getPopupNews = async (req, res) => {
    try {
        const news = await News.findOne({ 
            where: { 
                status: 'active', 
                showAsPopup: true 
            },
            order: [['publishedDate', 'DESC']]
        });

        res.status(200).json({
            success: true,
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create news (admin)
// @route   POST /api/news
// @access  Private/Admin
exports.createNews = [
    upload.single('image'),
    async (req, res) => {
        try {
            const { title, content, publishedDate } = req.body;

            const newsData = {
                title,
                content,
                createdBy: req.user.id,
                publishedDate: publishedDate || new Date()
            };

            if (req.file) {
                newsData.imageUrl = `/uploads/news/${req.file.filename}`;
            }

            const news = await News.create(newsData);

            res.status(201).json({
                success: true,
                message: 'News created successfully',
                news
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Server error'
            });
        }
    }
];

// @desc    Update news (admin)
// @route   PUT /api/news/:id
// @access  Private/Admin
exports.updateNews = async (req, res) => {
    try {
        const { title, content, status, showAsPopup } = req.body;

        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        if (title) news.title = title;
        if (content) news.content = content;
        if (status) news.status = status;
        if (showAsPopup !== undefined) news.showAsPopup = showAsPopup;

        await news.save();

        res.status(200).json({
            success: true,
            message: 'News updated successfully',
            news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete news (admin)
// @route   DELETE /api/news/:id
// @access  Private/Admin
exports.deleteNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        await news.destroy();

        res.status(200).json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
