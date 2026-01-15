const { BankAccount } = require('../models');

// @desc    Get all active bank accounts
// @route   GET /api/bank
// @access  Public
exports.getBankAccounts = async (req, res) => {
    try {
        const banks = await BankAccount.findAll({ where: { isActive: true } });
        res.status(200).json({
            success: true,
            count: banks.length,
            data: banks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Get all bank accounts (for admin)
// @route   GET /api/bank/admin
// @access  Private/Admin
exports.getAllBankAccounts = async (req, res) => {
    try {
        const banks = await BankAccount.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json({
            success: true,
            count: banks.length,
            data: banks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};

// @desc    Create a new bank account
// @route   POST /api/bank
// @access  Private/Admin
exports.createBankAccount = async (req, res) => {
    try {
        const bank = await BankAccount.create(req.body);
        res.status(201).json({
            success: true,
            data: bank,
            message: 'Bank account created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Invalid data'
        });
    }
};

// @desc    Update a bank account
// @route   PUT /api/bank/:id
// @access  Private/Admin
exports.updateBankAccount = async (req, res) => {
    try {
        const bank = await BankAccount.findByPk(req.params.id);

        if (!bank) {
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

        await bank.update(req.body);

        res.status(200).json({
            success: true,
            data: bank,
            message: 'Bank account updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Update failed'
        });
    }
};

// @desc    Delete a bank account
// @route   DELETE /api/bank/:id
// @access  Private/Admin
exports.deleteBankAccount = async (req, res) => {
    try {
        const bank = await BankAccount.findByPk(req.params.id);

        if (!bank) {
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

        await bank.destroy();

        res.status(200).json({
            success: true,
            message: 'Bank account deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Delete failed'
        });
    }
};
