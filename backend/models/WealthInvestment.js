const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class WealthInvestment extends Model {}

WealthInvestment.init({
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
    wealthFund: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'wealth_funds',
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    fundingSource: {
        type: DataTypes.JSON,
        defaultValue: {
            incomeWallet: 0,
            personalWallet: 0,
            tasksWallet: 0
        }
    },
    dailyProfit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    profitType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false
    },
    days: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalRevenue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active'
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'WealthInvestment',
    tableName: 'wealth_investments',
    indexes: [
        { fields: ['user', 'status'] },
        { fields: ['wealthFund'] },
        { fields: ['status', 'endDate'] }
    ],
    hooks: {
        beforeCreate: (investment) => {
            const endDate = new Date(investment.startDate);
            endDate.setDate(endDate.getDate() + investment.days);
            investment.endDate = endDate;
        }
    }
});

module.exports = WealthInvestment;
