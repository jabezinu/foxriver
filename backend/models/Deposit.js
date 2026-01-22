const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Deposit extends Model { }

Deposit.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            async isValidAmount(value) {
                // Dynamically get allowed amounts from membership tiers ONLY
                const Membership = require('./Membership');
                const memberships = await Membership.findAll({
                    attributes: ['price'],
                    where: {
                        price: { [require('sequelize').Op.gt]: 0 } // Exclude free memberships (Intern)
                    }
                });
                
                // Extract prices and convert to numbers - ONLY membership prices
                const allowedAmounts = memberships.map(m => parseFloat(m.price)).sort((a, b) => a - b);
                
                const numValue = parseFloat(value);
                if (!allowedAmounts.includes(numValue)) {
                    throw new Error(`Amount must be one of the membership tier prices: ${allowedAmounts.join(', ')}`);
                }
            }
        }
    },
    paymentMethod: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'bank_accounts',
            key: 'id'
        }
    },
    transactionFT: {
        type: DataTypes.STRING,
        allowNull: true
    },
    transactionScreenshot: {
        type: DataTypes.STRING,
        allowNull: true
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'ft_submitted', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Deposit',
    tableName: 'deposits',
    indexes: [
        { fields: ['user', 'status'] },
        { fields: ['status', 'createdAt'] }
    ]
});

module.exports = Deposit;
