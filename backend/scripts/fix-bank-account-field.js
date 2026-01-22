const { sequelize } = require('../config/database');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Script to fix bank account field issues in production
 * This script will:
 * 1. Check all users with bank account data
 * 2. Fix any malformed JSON data
 * 3. Ensure proper structure
 */

async function fixBankAccountField() {
    try {
        console.log('🔧 Starting bank account field fix...');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Get all users
        const users = await User.findAll();
        console.log(`📊 Found ${users.length} users to check`);
        
        let fixedCount = 0;
        
        for (const user of users) {
            let needsUpdate = false;
            
            console.log(`\n👤 Checking user ${user.id}:`);
            console.log('  Current bankAccount:', user.bankAccount);
            console.log('  Type:', typeof user.bankAccount);
            
            // Check if bankAccount is null or malformed
            if (!user.bankAccount || typeof user.bankAccount !== 'object') {
                console.log('  ❌ Bank account is null or not an object, setting default');
                user.bankAccount = {
                    accountName: null,
                    bank: null,
                    accountNumber: null,
                    phone: null,
                    isSet: false
                };
                needsUpdate = true;
            } else if (!user.bankAccount.hasOwnProperty('isSet')) {
                console.log('  ❌ Bank account missing isSet property');
                user.bankAccount.isSet = !!(user.bankAccount.accountName && user.bankAccount.bank && user.bankAccount.accountNumber);
                needsUpdate = true;
            }
            
            // Check pendingBankAccount
            if (user.pendingBankAccount && typeof user.pendingBankAccount === 'string') {
                console.log('  ❌ Pending bank account is string, parsing...');
                try {
                    user.pendingBankAccount = JSON.parse(user.pendingBankAccount);
                    needsUpdate = true;
                } catch (e) {
                    console.log('  ❌ Failed to parse pending bank account, setting to null');
                    user.pendingBankAccount = null;
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                try {
                    await user.save();
                    console.log('  ✅ User updated successfully');
                    fixedCount++;
                } catch (error) {
                    console.error('  ❌ Failed to update user:', error.message);
                }
            } else {
                console.log('  ✅ User data is correct');
            }
        }
        
        console.log(`\n🎉 Fix completed! Updated ${fixedCount} users`);
        
    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script if called directly
if (require.main === module) {
    fixBankAccountField();
}

module.exports = { fixBankAccountField };