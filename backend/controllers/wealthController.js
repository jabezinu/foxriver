const { WealthFund, WealthInvestment, User, sequelize } = require('../models');
const cloudinary = require('../config/cloudinary');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const upload = require('../middlewares/upload');

// @desc    Get all active wealth funds
// @route   GET /api/wealth/funds
// @access  Private
exports.getWealthFunds = asyncHandler(async (req, res) => {
    const funds = await WealthFund.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: funds });
});

// @desc    Get single wealth fund
// @route   GET /api/wealth/funds/:id
// @access  Private
exports.getWealthFund = asyncHandler(async (req, res) => {
    const fund = await WealthFund.findByPk(req.params.id);
    if (!fund) throw new AppError('Wealth fund not found', 404);
    res.status(200).json({ success: true, data: fund });
});

// @desc    Create investment
// @route   POST /api/wealth/invest
// @access  Private
exports.createInvestment = asyncHandler(async (req, res) => {
    const { wealthFundId, amount, fundingSource, transactionPassword } = req.body;

    if (!wealthFundId || !amount || !fundingSource) {
        throw new AppError('Please provide all required fields', 400);
    }

    const fund = await WealthFund.findByPk(wealthFundId);
    if (!fund || !fund.isActive) throw new AppError('Wealth fund not found or inactive', 404);

    if (parseFloat(amount) < parseFloat(fund.minimumDeposit)) {
        throw new AppError(`Minimum deposit is ${fund.minimumDeposit} ETB`, 400);
    }

    const user = await User.findByPk(req.user.id);

    if (transactionPassword) {
        if (!user.transactionPassword) throw new AppError('Set transaction password first', 400);
        const isMatch = await user.matchTransactionPassword(transactionPassword);
        if (!isMatch) throw new AppError('Invalid transaction password', 400);
    }

    const incomeAmount = parseFloat(fundingSource.incomeWallet) || 0;
    const personalAmount = parseFloat(fundingSource.personalWallet) || 0;
    const investAmount = parseFloat(amount);

    if (Math.abs(incomeAmount + personalAmount - investAmount) > 0.01) {
        throw new AppError('Funding amounts must equal investment amount', 400);
    }

    if (parseFloat(user.incomeWallet) < incomeAmount || parseFloat(user.personalWallet) < personalAmount) {
        throw new AppError('Insufficient balance', 400);
    }

    const totalRevenue = investAmount + (fund.profitType === 'percentage'
        ? (investAmount * parseFloat(fund.dailyProfit) / 100 * fund.days)
        : (parseFloat(fund.dailyProfit) * fund.days));

    const investment = await sequelize.transaction(async (t) => {
        user.incomeWallet = parseFloat(user.incomeWallet) - incomeAmount;
        user.personalWallet = parseFloat(user.personalWallet) - personalAmount;
        await user.save({ transaction: t });

        return await WealthInvestment.create({
            user: req.user.id,
            wealthFund: wealthFundId,
            amount: investAmount,
            fundingSource: { incomeWallet: incomeAmount, personalWallet: personalAmount },
            dailyProfit: fund.dailyProfit,
            profitType: fund.profitType,
            days: fund.days,
            totalRevenue
        }, { transaction: t });
    });

    const populated = await WealthInvestment.findByPk(investment.id, {
        include: [{ model: WealthFund, as: 'fund' }]
    });

    res.status(201).json({ success: true, message: 'Investment created', data: populated });
});

// @desc    Get user investments
// @route   GET /api/wealth/my-investments
// @access  Private
exports.getMyInvestments = asyncHandler(async (req, res) => {
    const investments = await WealthInvestment.findAll({
        where: { user: req.user.id },
        include: [{ model: WealthFund, as: 'fund' }],
        order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: investments });
});

// @desc    Get all wealth funds (Admin)
// @route   GET /api/wealth/admin/funds
// @access  Private/Admin
exports.getAllWealthFunds = asyncHandler(async (req, res) => {
    const funds = await WealthFund.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: funds });
});

// @desc    Handle Cloudinary upload
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

// @desc    Create wealth fund (Admin)
// @route   POST /api/wealth/admin/funds
// @access  Private/Admin
exports.createWealthFund = [
    upload.single('image'),
    asyncHandler(async (req, res) => {
        const fundData = { ...req.body };
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'foxriver/wealth');
            fundData.image = result.secure_url;
        }
        const fund = await WealthFund.create(fundData);
        res.status(201).json({ success: true, message: 'Wealth fund created', data: fund });
    })
];

// @desc    Update wealth fund (Admin)
// @route   PUT /api/wealth/admin/funds/:id
// @access  Private/Admin
exports.updateWealthFund = [
    upload.single('image'),
    asyncHandler(async (req, res) => {
        const fund = await WealthFund.findByPk(req.params.id);
        if (!fund) throw new AppError('Wealth fund not found', 404);

        const fundData = { ...req.body };
        if (req.file) {
            if (fund.image) {
                try {
                    const publicId = `foxriver/wealth/${fund.image.split('/').pop().split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (e) { console.warn('Cloudinary cleanup failed'); }
            }
            const result = await uploadToCloudinary(req.file.buffer, 'foxriver/wealth');
            fundData.image = result.secure_url;
        }

        await fund.update(fundData);
        res.status(200).json({ success: true, message: 'Wealth fund updated', data: fund });
    })
];

// @desc    Delete wealth fund (Admin)
// @route   DELETE /api/wealth/admin/funds/:id
// @access  Private/Admin
exports.deleteWealthFund = asyncHandler(async (req, res) => {
    const fund = await WealthFund.findByPk(req.params.id);
    if (!fund) throw new AppError('Wealth fund not found', 404);

    if (fund.image) {
        try {
            const publicId = `foxriver/wealth/${fund.image.split('/').pop().split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (e) { console.warn('Cloudinary cleanup failed'); }
    }

    await fund.destroy();
    res.status(200).json({ success: true, message: 'Wealth fund deleted' });
});

// @desc    Get all investments (Admin)
// @route   GET /api/wealth/admin/investments
// @access  Private/Admin
exports.getAllInvestments = asyncHandler(async (req, res) => {
    const investments = await WealthInvestment.findAll({
        include: [
            { model: User, as: 'investor', attributes: ['phone', 'membershipLevel'] },
            { model: WealthFund, as: 'fund' }
        ],
        order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: investments });
});
