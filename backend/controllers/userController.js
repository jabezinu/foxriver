const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { isValidTransactionPassword } = require('../utils/validators');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+transactionPassword');

        // Check for pending bank account change
        if (user.bankChangeStatus === 'pending') {
            const threeDaysInMillis = 3 * 24 * 60 * 60 * 1000;
            const timeDiff = Date.now() - new Date(user.bankChangeRequestDate).getTime();

            if (timeDiff >= threeDaysInMillis) {
                // Auto-approve after 3 days
                user.bankAccount = {
                    ...user.pendingBankAccount,
                    isSet: true
                };
                user.bankChangeStatus = 'none';
                user.pendingBankAccount = undefined;
                user.bankChangeRequestDate = undefined;
                await user.save();
            }
        }

        const userObj = user.toObject();
        const hasTransactionPassword = !!userObj.transactionPassword;
        delete userObj.transactionPassword;

        res.status(200).json({
            success: true,
            user: {
                ...userObj,
                hasTransactionPassword
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (name.length > 50) {
            return res.status(400).json({
                success: false,
                message: 'Name cannot exceed 50 characters'
            });
        }

        const user = await User.findById(req.user.id);
        user.name = name.trim();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                phone: user.phone,
                membershipLevel: user.membershipLevel,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Upload profile photo
// @route   POST /api/users/profile-photo
// @access  Private
exports.uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const user = await User.findById(req.user.id);

        // Delete old profile photo from Cloudinary if exists
        if (user.profilePhoto) {
            try {
                // Extract public_id from the Cloudinary URL
                const urlParts = user.profilePhoto.split('/');
                const publicIdWithExt = urlParts[urlParts.length - 1];
                const publicId = `foxriver/profiles/${publicIdWithExt.split('.')[0]}`;
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.log('Old photo not found or already deleted from Cloudinary');
            }
        }

        // Upload new photo to Cloudinary
        const uploadStream = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'foxriver/profiles',
                        public_id: `profile-${user._id}-${Date.now()}`,
                        transformation: [
                            { width: 500, height: 500, crop: 'limit' },
                            { quality: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadStream();

        // Save Cloudinary URL to database
        user.profilePhoto = result.secure_url;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully',
            profilePhoto: user.profilePhoto
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Delete profile photo
// @route   DELETE /api/users/profile-photo
// @access  Private
exports.deleteProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.profilePhoto) {
            return res.status(400).json({
                success: false,
                message: 'No profile photo to delete'
            });
        }

        // Delete photo from Cloudinary
        try {
            // Extract public_id from the Cloudinary URL
            const urlParts = user.profilePhoto.split('/');
            const publicIdWithExt = urlParts[urlParts.length - 1];
            const publicId = `foxriver/profiles/${publicIdWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.log('Photo file not found on Cloudinary');
        }

        user.profilePhoto = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile photo deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get wallet balances
// @route   GET /api/users/wallet
// @access  Private
exports.getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            wallet: {
                incomeWallet: user.incomeWallet,
                personalWallet: user.personalWallet,
                total: user.incomeWallet + user.personalWallet
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Set/update bank account
// @route   PUT /api/users/bank-account
// @access  Private
exports.setBankAccount = async (req, res) => {
    try {
        const { accountName, bank, accountNumber, phone } = req.body;

        const user = await User.findById(req.user.id);

        // If bank account is already set, handle as change request
        if (user.bankAccount.isSet) {
            user.pendingBankAccount = {
                accountName,
                bank,
                accountNumber,
                phone
            };
            user.bankChangeStatus = 'pending';
            user.bankChangeRequestDate = Date.now();
            await user.save();

            return res.status(200).json({
                success: true,
                message: 'Bank account change requested. It will be updated automatically in 3 days.',
                isPending: true,
                requestDate: user.bankChangeRequestDate
            });
        }

        user.bankAccount = {
            accountName,
            bank,
            accountNumber,
            phone,
            isSet: true
        };

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Bank account saved successfully',
            bankAccount: user.bankAccount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Set/change transaction password
// @route   PUT /api/users/transaction-password
// @access  Private (Rank 1+)
exports.setTransactionPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!isValidTransactionPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Transaction password must be exactly 6 digits'
            });
        }

        const user = await User.findById(req.user.id).select('+transactionPassword');

        // If user has existing transaction password, verify current password
        if (user.transactionPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide current transaction password to change it'
                });
            }

            if (currentPassword === newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "You didn't change the password"
                });
            }
            const isMatch = await user.matchTransactionPassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Current transaction password is incorrect'
                });
            }
        }

        user.transactionPassword = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: user.transactionPassword ? 'Transaction password updated successfully' : 'Transaction password created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Change login password
// @route   PUT /api/users/login-password
// @access  Private
exports.changeLoginPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const user = await User.findById(req.user.id).select('+password');

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get referral link
// @route   GET /api/users/referral-link
// @access  Private (Rank 1+)
exports.getReferralLink = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        const referralLink = user.getReferralLink();

        if (!referralLink) {
            return res.status(403).json({
                success: false,
                message: 'Please upgrade your level to access referral link'
            });
        }

        res.status(200).json({
            success: true,
            referralLink,
            invitationCode: user.invitationCode
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
