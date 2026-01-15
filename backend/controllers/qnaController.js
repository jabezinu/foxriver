const { QnA, User } = require('../models');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/qna');
    },
    filename: function (req, file, cb) {
        cb(null, `qna-${Date.now()}${path.extname(file.originalname)}`);
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

// @desc    Get all Q&A images
// @route   GET /api/qna
// @access  Public
exports.getQnA = async (req, res) => {
    try {
        const qnaItems = await QnA.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: qnaItems.length,
            qna: qnaItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Upload Q&A image (admin)
// @route   POST /api/qna/upload
// @access  Private/Admin
exports.uploadQnA = [
    upload.single('image'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image file'
                });
            }

            const imageUrl = `/uploads/qna/${req.file.filename}`;

            const qna = await QnA.create({
                imageUrl,
                uploadedBy: req.user.id
            });

            res.status(201).json({
                success: true,
                message: 'Q&A image uploaded successfully',
                qna
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Server error'
            });
        }
    }
];

// @desc    Delete Q&A image (admin)
// @route   DELETE /api/qna/:id
// @access  Private/Admin
exports.deleteQnA = async (req, res) => {
    try {
        const qna = await QnA.findByPk(req.params.id);

        if (!qna) {
            return res.status(404).json({
                success: false,
                message: 'Q&A image not found'
            });
        }

        await qna.destroy();

        res.status(200).json({
            success: true,
            message: 'Q&A image deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
