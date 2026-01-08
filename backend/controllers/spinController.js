const SpinResult = require('../models/SpinResult');
const User = require('../models/User');
const SlotTier = require('../models/SlotTier');

// @desc    Spin the wheel
// @route   POST /api/spin
// @access  Private
exports.spinWheel = async (req, res) => {
    try {
        const userId = req.user._id;
        const { walletType, tierId } = req.body; // 'personal' or 'income', and tier ID

        console.log('Spin request:', { userId, walletType, tierId });

        // Validate required fields
        if (!tierId) {
            return res.status(400).json({
                success: false,
                message: 'Tier ID is required'
            });
        }

        if (!walletType || !['personal', 'income'].includes(walletType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid wallet type is required (personal or income)'
            });
        }

        // Get the selected tier
        const tier = await SlotTier.findById(tierId);
        
        if (!tier || !tier.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive slot tier'
            });
        }

        const spinCost = tier.betAmount;
        const winAmount = tier.winAmount;
        const winProbability = tier.winProbability / 100; // Convert percentage to decimal

        // Get user with current balance
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Determine which wallet to use
        const wallet = walletType === 'income' ? 'incomeWallet' : 'personalWallet';
        const walletName = walletType === 'income' ? 'income' : 'personal';

        // Check if user has enough balance
        if (user[wallet] < spinCost) {
            return res.status(400).json({
                success: false,
                message: `Insufficient ${walletName} balance. You need ${spinCost} ETB to play.`
            });
        }

        const balanceBefore = user[wallet];

        // Deduct spin cost from selected wallet
        user[wallet] -= spinCost;

        // Determine result based on tier's win probability
        const random = Math.random();
        const isWin = random < winProbability;
        
        let result, amountWon = 0;
        
        if (isWin) {
            result = `Win ${winAmount} ETB`;
            amountWon = winAmount;
            // Winnings always go to income wallet
            user.incomeWallet += amountWon;
        } else {
            result = 'Try Again';
        }

        await user.save();

        const balanceAfter = user[wallet];
        const incomeBalanceAfter = user.incomeWallet;

        // Create spin result record
        const spinResult = await SpinResult.create({
            userId,
            result,
            amountPaid: spinCost,
            amountWon,
            balanceBefore,
            balanceAfter,
            walletType: walletName,
            tierId: tier._id,
            tierName: tier.name
        });

        // Populate user info for response
        await spinResult.populate('userId', 'phone membershipLevel');

        res.status(200).json({
            success: true,
            data: {
                result,
                amountWon,
                balanceBefore,
                balanceAfter,
                incomeBalanceAfter,
                spinResult
            }
        });

    } catch (error) {
        console.error('Spin wheel error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error spinning the wheel',
            error: error.message
        });
    }
};

// @desc    Get user's spin history
// @route   GET /api/spin/history
// @access  Private
exports.getUserSpinHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const spins = await SpinResult.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SpinResult.countDocuments({ userId });

        // Calculate stats
        const stats = await SpinResult.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalSpins: { $sum: 1 },
                    totalPaid: { $sum: '$amountPaid' },
                    totalWon: { $sum: '$amountWon' },
                    wins: {
                        $sum: {
                            $cond: [{ $eq: ['$result', 'Win 100 ETB'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                spins,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats: stats[0] || {
                    totalSpins: 0,
                    totalPaid: 0,
                    totalWon: 0,
                    wins: 0
                }
            }
        });

    } catch (error) {
        console.error('Get spin history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching spin history',
            error: error.message
        });
    }
};

// @desc    Get all spin results (Admin)
// @route   GET /api/spin/admin/all
// @access  Private/Admin
exports.getAllSpinResults = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const filter = {};
        
        // Filter by result type
        if (req.query.result) {
            filter.result = req.query.result;
        }

        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }

        const spins = await SpinResult.find(filter)
            .populate('userId', 'phone membershipLevel')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await SpinResult.countDocuments(filter);

        // Calculate overall stats
        const stats = await SpinResult.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalSpins: { $sum: 1 },
                    totalPaid: { $sum: '$amountPaid' },
                    totalWon: { $sum: '$amountWon' },
                    wins: {
                        $sum: {
                            $cond: [{ $eq: ['$result', 'Win 100 ETB'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                spins,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats: stats[0] || {
                    totalSpins: 0,
                    totalPaid: 0,
                    totalWon: 0,
                    wins: 0
                }
            }
        });

    } catch (error) {
        console.error('Get all spin results error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching spin results',
            error: error.message
        });
    }
};
