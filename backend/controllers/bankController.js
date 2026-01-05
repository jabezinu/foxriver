const BankAccount = require('../models/BankAccount');

// @desc    Get all active bank accounts
// @route   GET /api/bank
// @access  Public
exports.getBankAccounts = async (req, res) => {
    try {
        const banks = await BankAccount.find({ isActive: true });
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
        const banks = await BankAccount.find().sort({ createdAt: -1 });
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
        const bank = await BankAccount.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!bank) {
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

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
        const bank = await BankAccount.findById(req.params.id);

        if (!bank) {
            return res.status(404).json({
                success: false,
                message: 'Bank account not found'
            });
        }

        await bank.deleteOne();

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
