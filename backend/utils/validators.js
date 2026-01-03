// Phone number validation for Ethiopia (+251)
exports.isValidEthiopianPhone = (phone) => {
    const phoneRegex = /^\+251\d{9}$/;
    return phoneRegex.test(phone);
};

// Allowed deposit amounts in ETB
exports.ALLOWED_DEPOSIT_AMOUNTS = [
    3300, 9600, 27000, 50000, 78000, 100000, 150000, 200000
];

// Allowed withdrawal amounts in ETB
exports.ALLOWED_WITHDRAWAL_AMOUNTS = [
    100, 200, 3300, 9600, 10000, 27000, 50000, 78000, 100000, 300000, 500000, 3000000, 5000000
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
