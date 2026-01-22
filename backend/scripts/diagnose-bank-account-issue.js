const { sequelize } = require('../config/database');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Comprehensive script to diagnose and fix bank account issues
 */

async function diagnoseBankAccountIssue() {
    try {
        console.log('🔍 Starting bank account diagnosis...');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected');
        
        // Test raw SQL query to see what's actually in the database
        console.log('\n📊 Raw database query test:');
        const [rawResults] = await sequelize.query(`
            SELECT id, phone, bankAccount, pendingBankAccount, bankChangeStatus 
            FROM users 
            WHERE bankAccount IS NOT NULL 
            AND JSON_EXTRACT(bankAccount, '$.isSet') = true
            LIMIT 5
        `);
        
        console.log('Raw results:', rawResults);
        
        // Test Sequelize model query
        console.log('\n🔍 Sequelize model query test:');
        const users = await User.findAll({
            where: sequelize.literal(`JSON_EXTRACT(bankAccount, '$.isSet') = true`),
            limit: 5
        });
        
        console.log(`Found ${users.length} users with bank accounts set`);
        
        for (const user of users) {
            console.log(`\n👤 User ${user.id} (${user.phone}):`);
            console.log('  bankAccount:', user.bankAccount);
            console.log('  bankAccount type:', typeof user.bankAccount);
            console.log('  bankAccount.isSet:', user.bankAccount?.isSet);
            console.log('  Raw bankAccount:', user.getDataValue('bankAccount'));
            
            // Test the getter method
            const bankAccountGetter = user.get('bankAccount');
            console.log('  Getter result:', bankAccountGetter);
            console.log('  Getter isSet:', bankAccountGetter?.isSet);
        }
        
        // Test a specific user if provided
        if (process.argv[2]) {
            const userId = process.argv[2];
            console.log(`\n🎯 Testing specific user ${userId}:`);
            
            const specificUser = await User.findByPk(userId);
            if (specificUser) {
                console.log('  User found:', {
                    id: specificUser.id,
                    phone: specificUser.phone,
                    bankAccount: specificUser.bankAccount,
                    bankAccountType: typeof specificUser.bankAccount,
                    bankAccountRaw: specificUser.getDataValue('bankAccount'),
                    pendingBankAccount: specificUser.pendingBankAccount,
                    bankChangeStatus: specificUser.bankChangeStatus
                });
                
                // Test JSON serialization
                const userJSON = specificUser.toJSON();
                console.log('  toJSON bankAccount:', userJSON.bankAccount);
            } else {
                console.log('  User not found');
            }
        }
        
        // Check database schema
        console.log('\n📋 Database schema check:');
        const [schemaResults] = await sequelize.query(`
            DESCRIBE users
        `);
        
        const bankAccountField = schemaResults.find(field => field.Field === 'bankAccount');
        console.log('bankAccount field schema:', bankAccountField);
        
        console.log('\n✅ Diagnosis completed');
        
    } catch (error) {
        console.error('❌ Diagnosis failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        await sequelize.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
if (require.main === module) {
    diagnoseBankAccountIssue();
}

module.exports = { diagnoseBankAccountIssue };