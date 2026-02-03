require('dotenv').config();
const { SystemSetting } = require('../models');

async function verify() {
    try {
        const settings = await SystemSetting.findOne();
        console.log('Verification Success!');
        console.log('Salary Wallet:', settings.salaryWallet);
        console.log('Task Wallet:', settings.taskWallet);
        console.log('Commission Wallet:', settings.commissionWallet);
        console.log('Rank Refund Wallet:', settings.rankUpgradeRefundWallet);
        process.exit(0);
    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
}

verify();
