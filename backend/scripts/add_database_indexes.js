/**
 * Database Index Creation Script
 * Run this script to add performance-optimizing indexes to MongoDB collections
 * 
 * Usage: node scripts/add_database_indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../config/logger');

// Import models
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Commission = require('../models/Commission');
const TaskCompletion = require('../models/TaskCompletion');
const Message = require('../models/Message');
const News = require('../models/News');
const Salary = require('../models/Salary');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info('MongoDB Connected for index creation');
    } catch (error) {
        logger.error('MongoDB connection failed', { error: error.message });
        process.exit(1);
    }
};

const createIndexes = async () => {
    try {
        logger.info('Starting index creation...');

        // User indexes
        logger.info('Creating User indexes...');
        await User.collection.createIndex({ phone: 1 }, { unique: true });
        await User.collection.createIndex({ invitationCode: 1 }, { unique: true, sparse: true });
        await User.collection.createIndex({ referrerId: 1 });
        await User.collection.createIndex({ membershipLevel: 1 });
        await User.collection.createIndex({ role: 1 });
        await User.collection.createIndex({ isActive: 1 });
        await User.collection.createIndex({ 'bankAccount.accountNumber': 1, 'bankAccount.bank': 1 });
        await User.collection.createIndex({ createdAt: -1 });
        logger.info('✓ User indexes created');

        // Deposit indexes
        logger.info('Creating Deposit indexes...');
        await Deposit.collection.createIndex({ user: 1, status: 1 });
        await Deposit.collection.createIndex({ status: 1, createdAt: -1 });
        await Deposit.collection.createIndex({ transactionFT: 1 }, { unique: true, sparse: true });
        await Deposit.collection.createIndex({ orderId: 1 }, { unique: true });
        await Deposit.collection.createIndex({ createdAt: -1 });
        logger.info('✓ Deposit indexes created');

        // Withdrawal indexes
        logger.info('Creating Withdrawal indexes...');
        await Withdrawal.collection.createIndex({ user: 1, status: 1 });
        await Withdrawal.collection.createIndex({ status: 1, createdAt: -1 });
        await Withdrawal.collection.createIndex({ createdAt: -1 });
        logger.info('✓ Withdrawal indexes created');

        // Commission indexes
        logger.info('Creating Commission indexes...');
        await Commission.collection.createIndex({ user: 1, createdAt: -1 });
        await Commission.collection.createIndex({ downlineUser: 1 });
        await Commission.collection.createIndex({ level: 1 });
        await Commission.collection.createIndex({ sourceTask: 1 });
        await Commission.collection.createIndex({ createdAt: -1 });
        logger.info('✓ Commission indexes created');

        // TaskCompletion indexes
        logger.info('Creating TaskCompletion indexes...');
        await TaskCompletion.collection.createIndex({ user: 1, createdAt: -1 });
        await TaskCompletion.collection.createIndex({ task: 1 });
        await TaskCompletion.collection.createIndex({ completedAt: -1 });
        logger.info('✓ TaskCompletion indexes created');

        // Message indexes
        logger.info('Creating Message indexes...');
        await Message.collection.createIndex({ user: 1, isRead: 1 });
        await Message.collection.createIndex({ createdAt: -1 });
        logger.info('✓ Message indexes created');

        // News indexes
        logger.info('Creating News indexes...');
        await News.collection.createIndex({ isActive: 1, createdAt: -1 });
        await News.collection.createIndex({ showAsPopup: 1, isActive: 1 });
        logger.info('✓ News indexes created');

        // Salary indexes
        logger.info('Creating Salary indexes...');
        await Salary.collection.createIndex({ user: 1, month: 1, year: 1 }, { unique: true });
        await Salary.collection.createIndex({ createdAt: -1 });
        logger.info('✓ Salary indexes created');

        logger.info('✅ All indexes created successfully!');
        
        // Display index information
        const collections = [
            { name: 'User', model: User },
            { name: 'Deposit', model: Deposit },
            { name: 'Withdrawal', model: Withdrawal },
            { name: 'Commission', model: Commission },
            { name: 'TaskCompletion', model: TaskCompletion },
            { name: 'Message', model: Message },
            { name: 'News', model: News },
            { name: 'Salary', model: Salary }
        ];

        logger.info('\n📊 Index Summary:');
        for (const { name, model } of collections) {
            const indexes = await model.collection.getIndexes();
            logger.info(`${name}: ${Object.keys(indexes).length} indexes`);
        }

    } catch (error) {
        logger.error('Error creating indexes', { error: error.message, stack: error.stack });
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await createIndexes();
        logger.info('\n✨ Index creation complete!');
        process.exit(0);
    } catch (error) {
        logger.error('Script failed', { error: error.message });
        process.exit(1);
    }
};

// Run the script
main();
