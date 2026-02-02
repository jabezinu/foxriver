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

    // Check if bank change needs confirmation with error handling
    let bankChangeInfo = { needsConfirmation: false };
    try {
        bankChangeInfo = await userService.processPendingBankChange(user);
    } catch (error) {
        logger.error('Error processing pending bank change', { 
            userId: user.id, 
            error: error.message 
        });
        // Continue with default bankChangeInfo to prevent complete failure
    }

    const userObj = user.toJSON();

    res.status(200).json({
        success: true,
        user: userObj,
        bankChangeInfo
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
            tasksWallet: parseFloat(user.tasksWallet),
            total: parseFloat(user.incomeWallet) + parseFloat(user.personalWallet) + parseFloat(user.tasksWallet)
        }
    });
});

// @desc    Set/update bank account
// @route   PUT /api/users/bank-account
// @access  Private
exports.setBankAccount = asyncHandler(async (req, res) => {
    const { accountName, bank, accountNumber, phone } = req.body;

    // Validate required fields
    if (!accountName || !bank || !accountNumber || !phone) {
        throw new AppError('All bank account fields are required', 400);
    }

    const user = await User.findByPk(req.user.id);

    // Check if user is Intern - only Rank 1+ can set bank account
    if (user.membershipLevel === 'Intern') {
        throw new AppError('Please upgrade to Rank 1 or higher to set up bank account', 403);
    }

    // Check if another user already has this bank account
    const isDuplicate = await userService.isBankAccountDuplicate(accountNumber, bank, user.id);

    if (isDuplicate) {
        throw new AppError('This bank account is already registered to another user', 400);
    }

    // If bank account is already set, handle as change request
    if (user.bankAccount && user.bankAccount.isSet) {
        // Check if the new data is the same as existing data
        const existingAccount = user.bankAccount;
        const isSameData = (
            existingAccount.accountName === accountName &&
            existingAccount.bank === bank &&
            existingAccount.accountNumber === accountNumber &&
            existingAccount.phone === phone
        );
        
        if (isSameData) {
            return res.status(200).json({
                success: true,
                message: 'No changes detected. Your bank account information is already up to date.',
                noChanges: true,
                bankAccount: user.bankAccount
            });
        }
        
        user.pendingBankAccount = {
            accountName,
            bank,
            accountNumber,
            phone
        };
        user.bankChangeStatus = 'pending';
        user.bankChangeRequestDate = Date.now();
        user.bankChangeConfirmations = [];
        
        try {
            await user.save();
        } catch (error) {
            logger.error('Failed to save bank change request', { userId: user.id, error: error.message });
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'Bank account change requested. You will need to confirm this change once per day for 3 consecutive days.',
            isPending: true,
            requestDate: user.bankChangeRequestDate,
            oldAccount: user.bankAccount,
            newAccount: user.pendingBankAccount
        });
    }

    user.bankAccount = {
        accountName,
        bank,
        accountNumber,
        phone,
        isSet: true
    };

    try {
        await user.save();
        await user.reload();
    } catch (error) {
        logger.error('Failed to save bank account', { 
            userId: user.id, 
            error: error.message 
        });
        throw new AppError('Failed to save bank account. Please try again.', 500);
    }

    res.status(200).json({
        success: true,
        message: 'Bank account saved successfully',
        bankAccount: user.bankAccount
    });
});

// @desc    Confirm bank account change
// @route   POST /api/users/bank-account/confirm
// @access  Private
exports.confirmBankChange = asyncHandler(async (req, res) => {
    const { confirmed } = req.body;

    if (typeof confirmed !== 'boolean') {
        throw new AppError('Confirmation status is required', 400);
    }

    try {
        const result = await userService.confirmBankChange(req.user.id, confirmed);

        if (result.declined) {
            return res.status(200).json({
                success: true,
                message: 'Bank account change request has been declined',
                declined: true
            });
        }

        if (result.completed) {
            return res.status(200).json({
                success: true,
                message: 'Bank account has been successfully updated!',
                completed: true
            });
        }

        res.status(200).json({
            success: true,
            message: `Confirmation ${result.confirmationCount} of 3 recorded. Please confirm again tomorrow.`,
            confirmationCount: result.confirmationCount
        });
    } catch (error) {
        logger.error('Bank account confirmation failed', { 
            userId: req.user.id, 
            error: error.message 
        });
        throw error;
    }
});

// @desc    Cancel bank account change
// @route   DELETE /api/users/bank-account/pending
// @access  Private
exports.cancelBankChange = asyncHandler(async (req, res) => {
    await userService.cancelBankChange(req.user.id);

    res.status(200).json({
        success: true,
        message: 'Bank account change request has been cancelled'
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
