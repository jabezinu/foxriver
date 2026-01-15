const { BankAccount } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

// @desc    Get all active bank accounts
// @route   GET /api/bank
// @access  Public
exports.getBankAccounts = asyncHandler(async (req, res) => {
    const banks = await BankAccount.findAll({ where: { isActive: true } });
    res.status(200).json({ success: true, count: banks.length, data: banks });
});

// @desc    Get all bank accounts (for admin)
// @route   GET /api/bank/admin
// @access  Private/Admin
exports.getAllBankAccounts = asyncHandler(async (req, res) => {
    const banks = await BankAccount.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, count: banks.length, data: banks });
});

// @desc    Create a new bank account
// @route   POST /api/bank
// @access  Private/Admin
exports.createBankAccount = asyncHandler(async (req, res) => {
    const bank = await BankAccount.create(req.body);
    res.status(201).json({ success: true, data: bank, message: 'Bank account created' });
});

// @desc    Update a bank account
// @route   PUT /api/bank/:id
// @access  Private/Admin
exports.updateBankAccount = asyncHandler(async (req, res) => {
    const bank = await BankAccount.findByPk(req.params.id);
    if (!bank) throw new AppError('Bank account not found', 404);

    await bank.update(req.body);
    res.status(200).json({ success: true, data: bank, message: 'Bank account updated' });
});

// @desc    Delete a bank account
// @route   DELETE /api/bank/:id
// @access  Private/Admin
exports.deleteBankAccount = asyncHandler(async (req, res) => {
    const bank = await BankAccount.findByPk(req.params.id);
    if (!bank) throw new AppError('Bank account not found', 404);

    await bank.destroy();
    res.status(200).json({ success: true, message: 'Bank account deleted' });
});
