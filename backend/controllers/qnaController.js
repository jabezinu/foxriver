const { QnA, User } = require('../models');
const cloudinary = require('../config/cloudinary');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const upload = require('../middlewares/upload');

// @desc    Get all Q&A images
// @route   GET /api/qna
// @access  Public
exports.getQnA = asyncHandler(async (req, res) => {
    const qnaItems = await QnA.findAll({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        success: true,
        count: qnaItems.length,
        qna: qnaItems
    });
});

// @desc    Upload Q&A image (admin)
// @route   POST /api/qna/upload
// @access  Private/Admin
exports.uploadQnA = [
    upload.single('image'),
    asyncHandler(async (req, res) => {
        if (!req.file) throw new AppError('Please upload an image file', 400);

        // Upload to Cloudinary
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'foxriver/qna', resource_type: 'image' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadStream();
        const qna = await QnA.create({
            imageUrl: result.secure_url,
            uploadedBy: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Q&A image uploaded successfully',
            qna
        });
    })
];

// @desc    Delete Q&A image (admin)
// @route   DELETE /api/qna/:id
// @access  Private/Admin
exports.deleteQnA = asyncHandler(async (req, res) => {
    const qna = await QnA.findByPk(req.params.id);
    if (!qna) throw new AppError('Q&A image not found', 404);

    // Delete image from Cloudinary
    if (qna.imageUrl) {
        try {
            const urlParts = qna.imageUrl.split('/');
            const publicIdWithExt = urlParts[urlParts.length - 1];
            const publicId = `foxriver/qna/${publicIdWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.warn('Cloudinary delete failed:', err.message);
        }
    }

    await qna.destroy();
    res.status(200).json({ success: true, message: 'Q&A image deleted' });
});
