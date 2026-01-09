const Deposit = require('../models/Deposit');
const User = require('../models/User');
const { isValidDepositAmount, generateOrderId } = require('../utils/validators');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure multer for memory storage (Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// @desc    Create deposit request
// @route   POST /api/deposits/create
// @access  Private
exports.createDeposit = async (req, res) => {
    try {
        const { amount, paymentMethod } = req.body;

        // Validate amount
        if (!isValidDepositAmount(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid deposit amount. Please select from allowed amounts.'
            });
        }

        // Create deposit with unique order ID
        const deposit = await Deposit.create({
            user: req.user.id,
            amount,
            paymentMethod,
            orderId: generateOrderId()
        });

        res.status(201).json({
            success: true,
            message: 'Deposit request created. Please submit transaction ID.',
            deposit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Submit transaction ID for deposit
// @route   POST /api/deposits/submit-ft
// @access  Private
exports.submitTransactionFT = [
    upload.single('screenshot'),
    async (req, res) => {
        try {
            // Configure Cloudinary (ensure env vars are loaded)
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });

            const { depositId, transactionFT } = req.body;

            // Validate Transaction ID Format
            if (!transactionFT) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID is required'
                });
            }

            // Validate Screenshot
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction screenshot is required'
                });
            }

            const ftCode = transactionFT.trim().toUpperCase();

            const deposit = await Deposit.findById(depositId);

            if (!deposit) {
                return res.status(404).json({
                    success: false,
                    message: 'Deposit not found'
                });
            }

            // Verify deposit belongs to user
            if (deposit.user.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized'
                });
            }

            if (deposit.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Transaction ID already submitted or deposit processed'
                });
            }

            // Check for uniqueness
            const existingDeposit = await Deposit.findOne({ transactionFT: ftCode });
            if (existingDeposit) {
                return res.status(400).json({
                    success: false,
                    message: "This Transaction ID isn't valid"
                });
            }

            // Upload to Cloudinary
            const uploadStream = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'transactions',
                            resource_type: 'image',
                            public_id: `transaction-${Date.now()}-${req.user.id}`
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(req.file.buffer);
                });
            };

            const cloudinaryResult = await uploadStream();

            deposit.transactionFT = ftCode;
            deposit.transactionScreenshot = cloudinaryResult.secure_url;
            deposit.status = 'ft_submitted';
            await deposit.save();

            res.status(200).json({
                success: true,
                message: 'Transaction ID and screenshot submitted successfully. Awaiting admin approval.',
                deposit
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Server error'
            });
        }
    }
];

// @desc    Get user's deposits
// @route   GET /api/deposits/user
// @access  Private
exports.getUserDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: deposits.length,
            deposits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all deposits (admin)
// @route   GET /api/deposits/all
// @access  Private/Admin
exports.getAllDeposits = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const deposits = await Deposit.find(filter)
            .populate('user', 'phone membershipLevel')
            .populate('approvedBy', 'phone')
            .populate('paymentMethod', 'bankName accountNumber accountHolderName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: deposits.length,
            deposits
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Approve deposit (admin)
// @route   PUT /api/deposits/:id/approve
// @access  Private/Admin
exports.approveDeposit = async (req, res) => {
    try {
        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: 'Deposit not found'
            });
        }

        if (deposit.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Deposit already approved'
            });
        }

        // Credit user's personal balance atomically
        await User.findByIdAndUpdate(deposit.user, { $inc: { personalWallet: deposit.amount } });

        // Update deposit status
        deposit.status = 'approved';
        deposit.approvedBy = req.user.id;
        deposit.approvedAt = new Date();
        deposit.adminNotes = req.body.notes || '';
        await deposit.save();

        res.status(200).json({
            success: true,
            message: 'Deposit approved and amount credited to user wallet',
            deposit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Reject deposit (admin)
// @route   PUT /api/deposits/:id/reject
// @access  Private/Admin
exports.rejectDeposit = async (req, res) => {
    try {
        const deposit = await Deposit.findById(req.params.id);

        if (!deposit) {
            return res.status(404).json({
                success: false,
                message: 'Deposit not found'
            });
        }

        deposit.status = 'rejected';
        deposit.adminNotes = req.body.notes || '';
        await deposit.save();

        res.status(200).json({
            success: true,
            message: 'Deposit rejected',
            deposit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
