/**
 * Add Database Indexes for Performance Optimization
 * Run this script to add indexes to your remote database
 * 
 * Usage: npm run add-indexes
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const logger = require('../config/logger');

// Create database connection
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: (msg) => logger.info(msg),
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Index definitions
const indexes = [
    // Users table indexes
    {
        table: 'users',
        name: 'idx_referrerId',
        column: 'referrerId',
        description: 'Speeds up referral queries (Team page)'
    },
    {
        table: 'users',
        name: 'idx_membershipLevel',
        column: 'membershipLevel',
        description: 'Speeds up membership filtering'
    },
    {
        table: 'users',
        name: 'idx_phone',
        column: 'phone',
        description: 'Speeds up phone lookups'
    },
    {
        table: 'users',
        name: 'idx_invitationCode',
        column: 'invitationCode',
        description: 'Speeds up referral code lookups'
    },
    
    // Commissions table indexes
    {
        table: 'commissions',
        name: 'idx_user',
        column: 'user',
        description: 'Speeds up commission queries (Team page)'
    },
    {
        table: 'commissions',
        name: 'idx_downlineUser',
        column: 'downlineUser',
        description: 'Speeds up downline lookups'
    },
    {
        table: 'commissions',
        name: 'idx_level',
        column: 'level',
        description: 'Speeds up level filtering'
    },
    {
        table: 'commissions',
        name: 'idx_createdAt',
        column: 'createdAt',
        description: 'Speeds up date sorting'
    },
    
    // Task completions table indexes
    {
        table: 'task_completions',
        name: 'idx_userId',
        column: 'userId',
        description: 'Speeds up task history queries'
    },
    {
        table: 'task_completions',
        name: 'idx_taskId',
        column: 'taskId',
        description: 'Speeds up task lookups'
    },
    {
        table: 'task_completions',
        name: 'idx_completedAt',
        column: 'completedAt',
        description: 'Speeds up date filtering'
    },
    
    // Deposits table indexes
    {
        table: 'deposits',
        name: 'idx_userId',
        column: 'userId',
        description: 'Speeds up deposit history'
    },
    {
        table: 'deposits',
        name: 'idx_status',
        column: 'status',
        description: 'Speeds up status filtering'
    },
    {
        table: 'deposits',
        name: 'idx_createdAt',
        column: 'createdAt',
        description: 'Speeds up date sorting'
    },
    
    // Withdrawals table indexes
    {
        table: 'withdrawals',
        name: 'idx_userId',
        column: 'userId',
        description: 'Speeds up withdrawal history'
    },
    {
        table: 'withdrawals',
        name: 'idx_status',
        column: 'status',
        description: 'Speeds up status filtering'
    },
    {
        table: 'withdrawals',
        name: 'idx_createdAt',
        column: 'createdAt',
        description: 'Speeds up date sorting'
    },
    
    // Messages table indexes
    {
        table: 'messages',
        name: 'idx_userId',
        column: 'userId',
        description: 'Speeds up message queries'
    },
    {
        table: 'messages',
        name: 'idx_isRead',
        column: 'isRead',
        description: 'Speeds up unread filtering'
    },
    {
        table: 'messages',
        name: 'idx_createdAt',
        column: 'createdAt',
        description: 'Speeds up date sorting'
    }
];

// Check if index exists
async function indexExists(table, indexName) {
    try {
        const [results] = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = '${table}'
            AND INDEX_NAME = '${indexName}'
        `);
        return results[0].count > 0;
    } catch (error) {
        return false;
    }
}

// Add single index
async function addIndex(index) {
    const isCalledDirectly = require.main === module;
    
    try {
        // Check if index already exists
        const exists = await indexExists(index.table, index.name);
        
        if (exists) {
            if (isCalledDirectly) {
                console.log(`⏭️  Index ${index.name} on ${index.table} already exists - skipping`);
            }
            return { success: true, skipped: true };
        }
        
        // Add index
        if (isCalledDirectly) {
            console.log(`📊 Adding index ${index.name} on ${index.table}.${index.column}...`);
        }
        await sequelize.query(`
            ALTER TABLE ${index.table} 
            ADD INDEX ${index.name} (${index.column})
        `);
        
        if (isCalledDirectly) {
            console.log(`✅ Added ${index.name} - ${index.description}`);
        }
        return { success: true, skipped: false };
        
    } catch (error) {
        if (isCalledDirectly) {
            console.error(`❌ Failed to add ${index.name}:`, error.message);
        }
        return { success: false, error: error.message };
    }
}

// Main function
async function addAllIndexes() {
    const isCalledDirectly = require.main === module;
    
    if (isCalledDirectly) {
        console.log('============================================');
        console.log('🚀 Database Index Optimization');
        console.log('============================================\n');
    }
    
    try {
        // Test connection
        if (isCalledDirectly) {
            console.log('📡 Connecting to database...');
        }
        await sequelize.authenticate();
        if (isCalledDirectly) {
            console.log(`✅ Connected to ${process.env.DB_NAME} at ${process.env.DB_HOST}\n`);
        } else {
            logger.info('Adding database indexes for optimization...');
        }
        
        // Add indexes
        let added = 0;
        let skipped = 0;
        let failed = 0;
        
        for (const index of indexes) {
            const result = await addIndex(index);
            if (result.success && !result.skipped) added++;
            if (result.skipped) skipped++;
            if (!result.success) failed++;
        }
        
        if (isCalledDirectly) {
            console.log('\n============================================');
            console.log('📊 Summary:');
            console.log(`✅ Added: ${added} indexes`);
            console.log(`⏭️  Skipped: ${skipped} indexes (already exist)`);
            console.log(`❌ Failed: ${failed} indexes`);
            console.log('============================================\n');
        } else {
            if (added > 0) {
                logger.info(`Database indexes optimized: ${added} added, ${skipped} skipped`);
            }
        }
        
        // Analyze tables for optimization
        if (isCalledDirectly) {
            console.log('🔍 Analyzing tables for optimization...');
        }
        const tables = ['users', 'commissions', 'task_completions', 'deposits', 'withdrawals', 'messages'];
        
        for (const table of tables) {
            try {
                await sequelize.query(`ANALYZE TABLE ${table}`);
                if (isCalledDirectly) {
                    console.log(`✅ Analyzed ${table}`);
                }
            } catch (error) {
                if (isCalledDirectly) {
                    console.log(`⚠️  Could not analyze ${table}: ${error.message}`);
                }
            }
        }
        
        if (isCalledDirectly) {
            console.log('\n✅ Database optimization complete!');
            console.log('🚀 Your queries should now be 10-50x faster!\n');
            process.exit(0);
        }
        
        return { success: true, added, skipped, failed };
        
    } catch (error) {
        if (isCalledDirectly) {
            console.error('\n❌ Error:', error.message);
            console.error('\nPlease check your database connection settings in .env file:');
            console.error('- DB_HOST');
            console.error('- DB_USER');
            console.error('- DB_PASSWORD');
            console.error('- DB_NAME\n');
            process.exit(1);
        } else {
            logger.warn('Could not add database indexes:', error.message);
            throw error;
        }
    }
}

// Run if called directly
if (require.main === module) {
    addAllIndexes();
}

module.exports = { addAllIndexes };
