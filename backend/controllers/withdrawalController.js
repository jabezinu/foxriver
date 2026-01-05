const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { isValidWithdrawalAmount } = require('../utils/validators');

// @desc    Create withdrawal request
// @route   POST /api/withdrawals/create
// @access  Private (V1+)
exports.createWithdrawal = async (req, res) => {
    try {
        const { amount, walletType, transactionPassword } = req.body;

        // Check if user is Intern (Removed restriction)
        /*
        if (req.user.membershipLevel === 'Intern') {
            return res.status(403).json({
                success: false,
                message: 'Intern users cannot withdraw. Please upgrade your level.'
            });
        }
        */

        // Check for withdrawal restriction
        if (req.user.withdrawalRestrictedUntil && new Date(req.user.withdrawalRestrictedUntil) > new Date()) {
            const restrictedDate = new Date(req.user.withdrawalRestrictedUntil).toLocaleDateString();
            return res.status(403).json({
                success: false,
                message: `Withdrawal restricted until ${restrictedDate}`
            });
        }

        // Validate amount
        if (!isValidWithdrawalAmount(amount)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid withdrawal amount. Please select from allowed amounts.'
            });
        }

        // Verify transaction password
        const user = await User.findById(req.user.id).select('+transactionPassword');

        if (!user.transactionPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please set transaction password first'
            });
        }

        if (transactionPassword.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Transaction password must be exactly 6 digits'
            });
        }

        const isMatch = await user.matchTransactionPassword(transactionPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect transaction password'
            });
        }

        // Check if user has sufficient balance
        const walletBalance = walletType === 'income' ? user.incomeWallet : user.personalWallet;

        if (walletBalance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient wallet balance'
            });
        }

        // Create withdrawal (tax calculation is done in model pre-save hook)
        const withdrawal = await Withdrawal.create({
            user: req.user.id,
            amount,
            walletType
        });

        res.status(201).json({
            success: true,
            message: 'Withdrawal request created. Awaiting admin approval.',
            withdrawal,
            note: `10% tax will be deducted. You will receive ${withdrawal.netAmount} ETB`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get user's withdrawals
// @route   GET /api/withdrawals/user
// @access  Private
exports.getUserWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: withdrawals.length,
            withdrawals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all withdrawals (admin)
// @route   GET /api/withdrawals/all
// @access  Private/Admin
exports.getAllWithdrawals = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const withdrawals = await Withdrawal.find(filter)
            .populate('user', 'phone membershipLevel bankAccount')
            .populate('approvedBy', 'phone')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: withdrawals.length,
            withdrawals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Approve withdrawal (admin)
// @route   PUT /api/withdrawals/:id/approve
// @access  Private/Admin
exports.approveWithdrawal = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        if (withdrawal.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal already approved'
            });
        }

        // Deduct from user's balance atomically
        const walletField = withdrawal.walletType === 'income' ? 'incomeWallet' : 'personalWallet';
        await User.findByIdAndUpdate(withdrawal.user, { $inc: { [walletField]: -withdrawal.amount } });

        // Update withdrawal status
        withdrawal.status = 'approved';
        withdrawal.approvedBy = req.user.id;
        withdrawal.approvedAt = new Date();
        withdrawal.adminNotes = req.body.notes || '';
        await withdrawal.save();

        res.status(200).json({
            success: true,
            message: 'Withdrawal approved and amount deducted from user wallet',
            withdrawal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Reject withdrawal (admin)
// @route   PUT /api/withdrawals/:id/reject
// @access  Private/Admin
exports.rejectWithdrawal = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);

        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: 'Withdrawal not found'
            });
        }

        withdrawal.status = 'rejected';
        withdrawal.adminNotes = req.body.notes || '';
        await withdrawal.save();

        res.status(200).json({
            success: true,
            message: 'Withdrawal rejected',
            withdrawal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};
