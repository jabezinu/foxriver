const { QnA, User } = require('../models');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Configure multer for memory storage (Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
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
            console.log('QnA upload request received');
            console.log('File:', req.file);
            console.log('User:', req.user);

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image file'
                });
            }

            // Upload to Cloudinary
            const uploadStream = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'foxriver/qna',
                            resource_type: 'image'
                        },
                        (error, result) => {
                            if (error) {
                                console.error('Cloudinary upload error:', error);
                                reject(error);
                            } else {
                                console.log('Cloudinary upload success:', result.secure_url);
                                resolve(result);
                            }
                        }
                    );
                    stream.end(req.file.buffer);
                });
            };

            const cloudinaryResult = await uploadStream();

            const qna = await QnA.create({
                imageUrl: cloudinaryResult.secure_url,
                uploadedBy: req.user.id
            });

            res.status(201).json({
                success: true,
                message: 'Q&A image uploaded successfully',
                qna
            });
        } catch (error) {
            console.error('QnA upload error:', error);
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

        // Delete image from Cloudinary
        if (qna.imageUrl) {
            try {
                // Extract public_id from the Cloudinary URL
                const urlParts = qna.imageUrl.split('/');
                const publicIdWithExt = urlParts[urlParts.length - 1];
                const publicId = `foxriver/qna/${publicIdWithExt.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.log('Image not found or already deleted from Cloudinary');
            }
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
