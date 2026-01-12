/**
 * Application Constants
 * Centralized location for all constant values
 */

// Membership Levels
exports.MEMBERSHIP_LEVELS = {
    INTERN: 'Intern',
    RANK_1: 'Rank 1',
    RANK_2: 'Rank 2',
    RANK_3: 'Rank 3',
    RANK_4: 'Rank 4',
    RANK_5: 'Rank 5',
    RANK_6: 'Rank 6',
    RANK_7: 'Rank 7',
    RANK_8: 'Rank 8',
    RANK_9: 'Rank 9',
    RANK_10: 'Rank 10'
};

// User Roles
exports.USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

// Transaction Status
exports.TRANSACTION_STATUS = {
    PENDING: 'pending',
    FT_SUBMITTED: 'ft_submitted',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

// Bank Names
exports.BANKS = {
    CBE: 'CBE',
    AWASH: 'Awash',
    BOA: 'BOA'
};

// Commission Levels
exports.COMMISSION_LEVELS = {
    A: 'A',
    B: 'B',
    C: 'C'
};

// Allowed Deposit Amounts (in ETB)
exports.DEPOSIT_AMOUNTS = [
    3300, 9600, 27000, 50000, 78000, 100000, 150000, 200000
];

// Allowed Withdrawal Amounts (in ETB)
exports.WITHDRAWAL_AMOUNTS = [
    100, 200, 3300, 9600, 10000, 27000, 50000, 78000, 
    100000, 300000, 500000, 3000000, 5000000
];

// Time Constants
exports.TIME = {
    ONE_MINUTE: 60 * 1000,
    FIVE_MINUTES: 5 * 60 * 1000,
    FIFTEEN_MINUTES: 15 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    ONE_DAY: 24 * 60 * 60 * 1000,
    THREE_DAYS: 3 * 24 * 60 * 60 * 1000,
    SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,
    THIRTY_DAYS: 30 * 24 * 60 * 60 * 1000
};

// Pagination Defaults
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
};

// File Upload Limits
exports.FILE_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

// Cloudinary Folders
exports.CLOUDINARY_FOLDERS = {
    PROFILES: 'foxriver/profiles',
    TRANSACTIONS: 'foxriver/transactions',
    NEWS: 'foxriver/news',
    QNA: 'foxriver/qna',
    TASKS: 'foxriver/tasks'
};

// Error Codes
exports.ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    WITHDRAWAL_RESTRICTED: 'WITHDRAWAL_RESTRICTED',
    INTERN_TRIAL_EXPIRED: 'INTERN_TRIAL_EXPIRED'
};

// Success Messages
exports.SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    DEPOSIT_CREATED: 'Deposit request created successfully',
    WITHDRAWAL_CREATED: 'Withdrawal request created successfully',
    TRANSACTION_APPROVED: 'Transaction approved successfully',
    TRANSACTION_REJECTED: 'Transaction rejected successfully'
};

// Error Messages
exports.ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    PHONE_EXISTS: 'Phone number already registered',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    INVALID_AMOUNT: 'Invalid amount',
    BANK_ACCOUNT_EXISTS: 'Bank account already registered',
    TRANSACTION_PASSWORD_REQUIRED: 'Transaction password required',
    INVALID_TRANSACTION_PASSWORD: 'Invalid transaction password'
};
