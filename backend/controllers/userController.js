const User = require('../models/User');
const userService = require('../services/userService');
const { isValidTransactionPassword } = require('../utils/validators');
const cloudinary = require('../config/cloudinary');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Process pending bank change if applicable
    await userService.processPendingBankChange(user);

    const userObj = user.toJSON();
    const hasTransactionPassword = !!userObj.transactionPassword;
    delete userObj.transactionPassword;

    res.status(200).json({
        success: true,
        user: {
            ...userObj,
            hasTransactionPassword
        }
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
        throw new AppError('Name is required', 400);
    }

    if (name.length > 50) {
        throw new AppError('Name cannot exceed 50 characters', 400);
    }

    const user = await userService.updateProfile(req.user.id, { name });

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            membershipLevel: user.membershipLevel,
            profilePhoto: user.profilePhoto
        }
    });
});

// @desc    Upload profile photo
// @route   POST /api/users/profile-photo
// @access  Private
exports.uploadProfilePhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('Please upload an image file', 400);
    }

    const user = await User.findByPk(req.user.id);

    // Delete old profile photo from Cloudinary if exists
    if (user.profilePhoto) {
        try {
            const urlParts = user.profilePhoto.split('/');
            const publicIdWithExt = urlParts[urlParts.length - 1];
            const publicId = `foxriver/profiles/${publicIdWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            logger.warn('Old photo not found or already deleted from Cloudinary', { userId: user.id });
        }
    }

    // Upload new photo to Cloudinary
    const uploadStream = () => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'foxriver/profiles',
                    public_id: `profile-${user.id}-${Date.now()}`,
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
});

// @desc    Delete profile photo
// @route   DELETE /api/users/profile-photo
// @access  Private
exports.deleteProfilePhoto = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (!user.profilePhoto) {
        throw new AppError('No profile photo to delete', 400);
    }

    // Delete photo from Cloudinary
    try {
        const urlParts = user.profilePhoto.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `foxriver/profiles/${publicIdWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        logger.warn('Photo file not found on Cloudinary', { userId: user.id });
    }

    user.profilePhoto = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile photo deleted successfully'
    });
});

// @desc    Get wallet balances
// @route   GET /api/users/wallet
// @access  Private
exports.getWalletBalance = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    res.status(200).json({
        success: true,
        wallet: {
            incomeWallet: parseFloat(user.incomeWallet),
            personalWallet: parseFloat(user.personalWallet),
            total: parseFloat(user.incomeWallet) + parseFloat(user.personalWallet)
        }
    });
});

// @desc    Set/update bank account
// @route   PUT /api/users/bank-account
// @access  Private
exports.setBankAccount = asyncHandler(async (req, res) => {
    const { accountName, bank, accountNumber, phone } = req.body;

    const user = await User.findByPk(req.user.id);

    // Check if another user already has this bank account
    const isDuplicate = await userService.isBankAccountDuplicate(accountNumber, bank, user.id);

    if (isDuplicate) {
        throw new AppError('This bank account is already registered to another user', 400);
    }

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
});

// @desc    Set/change transaction password
// @route   PUT /api/users/transaction-password
// @access  Private (Rank 1+)
exports.setTransactionPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!isValidTransactionPassword(newPassword)) {
        throw new AppError('Transaction password must be exactly 6 digits', 400);
    }

    const user = await User.findByPk(req.user.id);

    // If user has existing transaction password, verify current password
    if (user.transactionPassword) {
        if (!currentPassword) {
            throw new AppError('Please provide current transaction password to change it', 400);
        }

        if (currentPassword === newPassword) {
            throw new AppError("You didn't change the password", 400);
        }

        const isMatch = await user.matchTransactionPassword(currentPassword);
        if (!isMatch) {
            throw new AppError('Current transaction password is incorrect', 401);
        }
    }

    user.transactionPassword = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: user.transactionPassword ? 'Transaction password updated successfully' : 'Transaction password created successfully'
    });
});

// @desc    Change login password
// @route   PUT /api/users/login-password
// @access  Private
exports.changeLoginPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new AppError('Please provide current and new password', 400);
    }

    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully'
    });
});

// @desc    Get referral link
// @route   GET /api/users/referral-link
// @access  Private (Rank 1+)
exports.getReferralLink = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);

    const referralLink = user.getReferralLink();

    if (!referralLink) {
        throw new AppError('Please upgrade your level to access referral link', 403);
    }

    res.status(200).json({
        success: true,
        referralLink,
        invitationCode: user.invitationCode
    });
});
