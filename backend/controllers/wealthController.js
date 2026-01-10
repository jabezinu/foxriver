const WealthFund = require('../models/WealthFund');
const WealthInvestment = require('../models/WealthInvestment');
const User = require('../models/User');

// @desc    Get all active wealth funds
// @route   GET /api/wealth/funds
// @access  Private
exports.getWealthFunds = async (req, res) => {
    try {
        const funds = await WealthFund.find({ isActive: true }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: funds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single wealth fund
// @route   GET /api/wealth/funds/:id
// @access  Private
exports.getWealthFund = async (req, res) => {
    try {
        const fund = await WealthFund.findById(req.params.id);
        
        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Wealth fund not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: fund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create investment
// @route   POST /api/wealth/invest
// @access  Private
exports.createInvestment = async (req, res) => {
    try {
        console.log('Investment request body:', req.body);
        const { wealthFundId, amount, fundingSource, transactionPassword } = req.body;
        
        // Validate input
        if (!wealthFundId || !amount || !fundingSource) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        
        // Get wealth fund
        const fund = await WealthFund.findById(wealthFundId);
        if (!fund || !fund.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Wealth fund not found or inactive'
            });
        }
        
        // Check minimum deposit
        if (parseFloat(amount) < fund.minimumDeposit) {
            return res.status(400).json({
                success: false,
                message: `Minimum deposit is ${fund.minimumDeposit} ETB`
            });
        }
        
        // Get user with transaction password
        const user = await User.findById(req.user.id).select('+transactionPassword');
        
        // Verify transaction password if provided
        if (transactionPassword) {
            if (!user.transactionPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please set up your transaction password first'
                });
            }
            
            const isPasswordValid = await user.matchTransactionPassword(transactionPassword);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid transaction password'
                });
            }
        }
        
        // Validate funding source
        const { incomeWallet = 0, personalWallet = 0 } = fundingSource;
        const incomeAmount = parseFloat(incomeWallet) || 0;
        const personalAmount = parseFloat(personalWallet) || 0;
        const investAmount = parseFloat(amount);
        const totalFunding = incomeAmount + personalAmount;
        
        // Use a small epsilon for floating point comparison
        if (Math.abs(totalFunding - investAmount) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Funding source amounts must equal investment amount'
            });
        }
        
        // Check if user has sufficient balance
        if (user.incomeWallet < incomeAmount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient income wallet balance'
            });
        }
        
        if (user.personalWallet < personalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient personal wallet balance'
            });
        }
        
        // Calculate total revenue
        let totalRevenue;
        if (fund.profitType === 'percentage') {
            const dailyProfitAmount = (investAmount * fund.dailyProfit) / 100;
            totalRevenue = investAmount + (dailyProfitAmount * fund.days);
        } else {
            totalRevenue = investAmount + (fund.dailyProfit * fund.days);
        }
        
        // Deduct from user wallets
        user.incomeWallet -= incomeAmount;
        user.personalWallet -= personalAmount;
        await user.save();
        
        // Create investment
        const investment = await WealthInvestment.create({
            user: req.user.id,
            wealthFund: wealthFundId,
            amount: investAmount,
            fundingSource: {
                incomeWallet: incomeAmount,
                personalWallet: personalAmount
            },
            dailyProfit: fund.dailyProfit,
            profitType: fund.profitType,
            days: fund.days,
            totalRevenue
        });
        
        const populatedInvestment = await WealthInvestment.findById(investment._id).populate('wealthFund');
        
        res.status(201).json({
            success: true,
            message: 'Investment created successfully',
            data: populatedInvestment
        });
    } catch (error) {
        console.error('Investment creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user investments
// @route   GET /api/wealth/my-investments
// @access  Private
exports.getMyInvestments = async (req, res) => {
    try {
        const investments = await WealthInvestment.find({ user: req.user.id })
            .populate('wealthFund')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: investments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all wealth funds (Admin)
// @route   GET /api/wealth/admin/funds
// @access  Private/Admin
exports.getAllWealthFunds = async (req, res) => {
    try {
        const funds = await WealthFund.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: funds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create wealth fund (Admin)
// @route   POST /api/wealth/admin/funds
// @access  Private/Admin
exports.createWealthFund = async (req, res) => {
    try {
        const fund = await WealthFund.create(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Wealth fund created successfully',
            data: fund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update wealth fund (Admin)
// @route   PUT /api/wealth/admin/funds/:id
// @access  Private/Admin
exports.updateWealthFund = async (req, res) => {
    try {
        const fund = await WealthFund.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Wealth fund not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Wealth fund updated successfully',
            data: fund
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete wealth fund (Admin)
// @route   DELETE /api/wealth/admin/funds/:id
// @access  Private/Admin
exports.deleteWealthFund = async (req, res) => {
    try {
        const fund = await WealthFund.findByIdAndDelete(req.params.id);
        
        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Wealth fund not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Wealth fund deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all investments (Admin)
// @route   GET /api/wealth/admin/investments
// @access  Private/Admin
exports.getAllInvestments = async (req, res) => {
    try {
        const investments = await WealthInvestment.find()
            .populate('user', 'name phone')
            .populate('wealthFund')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: investments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
