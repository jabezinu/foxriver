// Phone number validation for Ethiopia (+251)
exports.isValidEthiopianPhone = (phone) => {
    const phoneRegex = /^\+251[79]\d{8}$/;
    return phoneRegex.test(phone);
};

// Allowed deposit amounts in ETB
exports.ALLOWED_DEPOSIT_AMOUNTS = [
    3600, 9900, 30000, 45000, 60000, 90000, 120000, 180000
];

// Allowed withdrawal amounts in ETB
exports.ALLOWED_WITHDRAWAL_AMOUNTS = [
    100, 200, 3600, 9900, 30000, 45000, 60000, 90000, 120000, 180000
];

// Validate deposit amount
exports.isValidDepositAmount = (amount) => {
    return exports.ALLOWED_DEPOSIT_AMOUNTS.includes(Number(amount));
};

// Validate withdrawal amount
exports.isValidWithdrawalAmount = (amount) => {
    return exports.ALLOWED_WITHDRAWAL_AMOUNTS.includes(Number(amount));
};

// Validate transaction password (6-digit numeric)
exports.isValidTransactionPassword = (password) => {
    const passwordRegex = /^\d{6}$/;
    return passwordRegex.test(password);
};

// Generate unique order ID for deposits
exports.generateOrderId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD${timestamp}${random}`;
};

// Generate unique invitation code
exports.generateInvitationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'FXR';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};
