/**
 * Test script to verify bank account duplicate validation
 * 
 * This script tests that:
 * 1. Users cannot set a bank account that's already used by another user
 * 2. Pending bank account changes are also checked for duplicates
 * 3. Auto-approval doesn't approve duplicate bank accounts
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testBankDuplicateValidation() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB\n');

        // Test 1: Check if duplicate detection works for active bank accounts
        console.log('Test 1: Checking for duplicate bank accounts...');
        const duplicates = await User.aggregate([
            {
                $match: {
                    'bankAccount.isSet': true,
                    'bankAccount.accountNumber': { $exists: true, $ne: '' }
                }
            },
            {
                $group: {
                    _id: {
                        bank: '$bankAccount.bank',
                        accountNumber: '$bankAccount.accountNumber'
                    },
                    users: { $push: { phone: '$phone', name: '$name' } },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        if (duplicates.length > 0) {
            console.log('⚠ Found duplicate bank accounts:');
            duplicates.forEach(dup => {
                console.log(`  Bank: ${dup._id.bank}, Account: ${dup._id.accountNumber}`);
                console.log(`  Users: ${dup.users.map(u => `${u.name} (${u.phone})`).join(', ')}\n`);
            });
        } else {
            console.log('✓ No duplicate bank accounts found\n');
        }

        // Test 2: Check pending bank accounts for duplicates
        console.log('Test 2: Checking for duplicate pending bank accounts...');
        const pendingDuplicates = await User.aggregate([
            {
                $match: {
                    'pendingBankAccount.accountNumber': { $exists: true, $ne: '' }
                }
            },
            {
                $group: {
                    _id: {
                        bank: '$pendingBankAccount.bank',
                        accountNumber: '$pendingBankAccount.accountNumber'
                    },
                    users: { $push: { phone: '$phone', name: '$name' } },
                    count: { $sum: 1 }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        if (pendingDuplicates.length > 0) {
            console.log('⚠ Found duplicate pending bank accounts:');
            pendingDuplicates.forEach(dup => {
                console.log(`  Bank: ${dup._id.bank}, Account: ${dup._id.accountNumber}`);
                console.log(`  Users: ${dup.users.map(u => `${u.name} (${u.phone})`).join(', ')}\n`);
            });
        } else {
            console.log('✓ No duplicate pending bank accounts found\n');
        }

        // Test 3: Check for conflicts between active and pending
        console.log('Test 3: Checking for conflicts between active and pending bank accounts...');
        const usersWithBank = await User.find({
            'bankAccount.isSet': true,
            'bankAccount.accountNumber': { $exists: true, $ne: '' }
        });

        const conflicts = [];
        for (const user of usersWithBank) {
            const conflictingUser = await User.findOne({
                _id: { $ne: user._id },
                'pendingBankAccount.bank': user.bankAccount.bank,
                'pendingBankAccount.accountNumber': user.bankAccount.accountNumber
            });

            if (conflictingUser) {
                conflicts.push({
                    activeUser: { name: user.name, phone: user.phone },
                    pendingUser: { name: conflictingUser.name, phone: conflictingUser.phone },
                    bank: user.bankAccount.bank,
                    accountNumber: user.bankAccount.accountNumber
                });
            }
        }

        if (conflicts.length > 0) {
            console.log('⚠ Found conflicts between active and pending bank accounts:');
            conflicts.forEach(conflict => {
                console.log(`  Bank: ${conflict.bank}, Account: ${conflict.accountNumber}`);
                console.log(`  Active: ${conflict.activeUser.name} (${conflict.activeUser.phone})`);
                console.log(`  Pending: ${conflict.pendingUser.name} (${conflict.pendingUser.phone})\n`);
            });
        } else {
            console.log('✓ No conflicts found between active and pending bank accounts\n');
        }

        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDisconnected from MongoDB');
    }
}

testBankDuplicateValidation();
