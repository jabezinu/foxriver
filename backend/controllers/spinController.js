const { SpinResult, User, SlotTier, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Spin the wheel
// @route   POST /api/spin
// @access  Private
exports.spinWheel = async (req, res) => {
    try {
        const userId = req.user.id;
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
        const tier = await SlotTier.findByPk(tierId);
        
        if (!tier || !tier.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or inactive slot tier'
            });
        }

        const spinCost = parseFloat(tier.betAmount);
        const winAmount = parseFloat(tier.winAmount);
        const winProbability = parseFloat(tier.winProbability) / 100; // Convert percentage to decimal

        // Get user with current balance
        const user = await User.findByPk(userId);

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
        if (parseFloat(user[wallet]) < spinCost) {
            return res.status(400).json({
                success: false,
                message: `Insufficient ${walletName} balance. You need ${spinCost} ETB to play.`
            });
        }

        const balanceBefore = parseFloat(user[wallet]);

        // Deduct spin cost from selected wallet
        user[wallet] = parseFloat(user[wallet]) - spinCost;

        // Determine result based on tier's win probability
        const random = Math.random();
        const isWin = random < winProbability;
        
        let result, amountWon = 0;
        
        if (isWin) {
            result = `Win ${winAmount} ETB`;
            amountWon = winAmount;
            // Winnings always go to income wallet
            user.incomeWallet = parseFloat(user.incomeWallet) + amountWon;
        } else {
            result = 'Try Again';
        }

        await user.save();

        const balanceAfter = parseFloat(user[wallet]);
        const incomeBalanceAfter = parseFloat(user.incomeWallet);

        // Create spin result record
        const spinResult = await SpinResult.create({
            user: userId,
            result,
            amountPaid: spinCost,
            amountWon,
            balanceBefore,
            balanceAfter,
            walletType: walletName,
            tier: tier.id
        });

        // Get user info for response
        const userInfo = await User.findByPk(userId, {
            attributes: ['phone', 'membershipLevel']
        });

        res.status(200).json({
            success: true,
            data: {
                result,
                amountWon,
                balanceBefore,
                balanceAfter,
                incomeBalanceAfter,
                spinResult: {
                    ...spinResult.toJSON(),
                    user: userInfo
                }
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
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const { count: total, rows: spins } = await SpinResult.findAndCountAll({
            where: { user: userId },
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });

        // Calculate stats using Sequelize aggregation
        const stats = await SpinResult.findOne({
            where: { user: userId },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalSpins'],
                [sequelize.fn('SUM', sequelize.col('amountPaid')), 'totalPaid'],
                [sequelize.fn('SUM', sequelize.col('amountWon')), 'totalWon'],
                [sequelize.literal(`SUM(CASE WHEN result LIKE 'Win%' THEN 1 ELSE 0 END)`), 'wins']
            ],
            raw: true
        });

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
                stats: stats || {
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
        const offset = (page - 1) * limit;

        const where = {};
        
        // Filter by result type
        if (req.query.result) {
            where.result = req.query.result;
        }

        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            where.createdAt = {};
            if (req.query.startDate) {
                where.createdAt[Op.gte] = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                where.createdAt[Op.lte] = new Date(req.query.endDate);
            }
        }

        const { count: total, rows: spins } = await SpinResult.findAndCountAll({
            where,
            include: [
                { model: User, as: 'player', attributes: ['phone', 'membershipLevel'] },
                { model: SlotTier, as: 'tierDetails', attributes: ['name', 'betAmount', 'winAmount'] }
            ],
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });

        // Calculate overall stats using Sequelize aggregation
        const stats = await SpinResult.findOne({
            where,
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalSpins'],
                [sequelize.fn('SUM', sequelize.col('amountPaid')), 'totalPaid'],
                [sequelize.fn('SUM', sequelize.col('amountWon')), 'totalWon'],
                [sequelize.literal(`SUM(CASE WHEN result LIKE 'Win%' THEN 1 ELSE 0 END)`), 'wins']
            ],
            raw: true
        });

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
                stats: stats || {
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
