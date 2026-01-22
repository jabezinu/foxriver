/**
 * Request validation middleware
 * Validates and sanitizes incoming requests
 */

const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result checker
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg).join(', ');
        throw new AppError(errorMessages, 400);
    }
    next();
};

// Auth validation rules
exports.registerValidation = [
    body('phone')
        .trim()
        .matches(/^\+251[79]\d{8}$/)
        .withMessage('Please provide a valid Ethiopian phone number (+251XXXXXXXXX)'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('invitationCode')
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Invalid invitation code')
];

exports.loginValidation = [
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Deposit validation rules
exports.depositValidation = [
    body('amount')
        .isInt({ min: 100 })
        .withMessage('Invalid deposit amount')
        .custom((value) => {
            const allowedAmounts = [3600, 9900, 30000, 45000, 60000, 90000, 120000, 180000];
            if (!allowedAmounts.includes(Number(value))) {
                throw new Error('Amount must be one of the allowed values');
            }
            return true;
        }),
    body('paymentMethod')
        .notEmpty()
        .withMessage('Payment method is required')
        .isMongoId()
        .withMessage('Invalid payment method ID')
];

// Withdrawal validation rules
exports.withdrawalValidation = [
    body('amount')
        .isInt({ min: 100 })
        .withMessage('Invalid withdrawal amount'),
    body('transactionPassword')
        .matches(/^\d{6}$/)
        .withMessage('Transaction password must be 6 digits')
];

// Bank account validation rules
exports.bankAccountValidation = [
    body('accountName')
        .trim()
        .notEmpty()
        .withMessage('Account name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Account name must be between 2 and 100 characters'),
    body('bank')
        .isIn(['CBE', 'Awash', 'BOA'])
        .withMessage('Invalid bank selection'),
    body('accountNumber')
        .trim()
        .notEmpty()
        .withMessage('Account number is required')
        .isLength({ min: 5, max: 30 })
        .withMessage('Invalid account number'),
    body('phone')
        .trim()
        .matches(/^\+251[79]\d{8}$/)
        .withMessage('Please provide a valid Ethiopian phone number')
];

// Transaction password validation rules
exports.transactionPasswordValidation = [
    body('newPassword')
        .matches(/^\d{6}$/)
        .withMessage('Transaction password must be exactly 6 digits'),
    body('currentPassword')
        .optional()
        .matches(/^\d{6}$/)
        .withMessage('Current password must be 6 digits')
];

// Profile update validation rules
exports.profileUpdateValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
];

// MongoDB ID validation
exports.mongoIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format')
];

// Pagination validation
exports.paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
