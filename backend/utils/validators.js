// Phone number validation for Ethiopia (+251)
exports.isValidEthiopianPhone = (phone) => {
    const phoneRegex = /^\+251[79]\d{8}$/;
    return phoneRegex.test(phone);
};

// Allowed withdrawal amounts in ETB
exports.ALLOWED_WITHDRAWAL_AMOUNTS = [
    750, 1600, 4500, 10000, 18700, 31500, 53200
];

// Validate deposit amount dynamically - ONLY membership tier prices
exports.isValidDepositAmount = async (amount) => {
    const Membership = require('../models/Membership');
    const { Op } = require('sequelize');
    
    const memberships = await Membership.findAll({
        attributes: ['price'],
        where: {
            price: { [Op.gt]: 0 } // Exclude free memberships (Intern)
        }
    });
    
    // Extract prices and convert to numbers - ONLY membership prices
    const allowedAmounts = memberships.map(m => parseFloat(m.price)).sort((a, b) => a - b);
    
    return allowedAmounts.includes(Number(amount));
};

// Validate withdrawal amount
exports.isValidWithdrawalAmount = (amount) => {
    return exports.ALLOWED_WITHDRAWAL_AMOUNTS.includes(Number(amount));
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
