const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SystemSetting extends Model { }

SystemSetting.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    commissionPercentA: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10
    },
    commissionPercentB: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 5
    },
    commissionPercentC: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 2
    },
    upgradeCommissionPercentA: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10
    },
    upgradeCommissionPercentB: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 5
    },
    upgradeCommissionPercentC: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 2
    },
    maxReferralsPerUser: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    salaryDirect15Threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 15
    },
    salaryDirect15Amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 15000
    },
    salaryDirect20Threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 20
    },
    salaryDirect20Amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 20000
    },
    salaryDirect10Threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    salaryDirect10Amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 10000
    },
    salaryNetwork40Threshold: {
        type: DataTypes.INTEGER,
        defaultValue: 40
    },
    salaryNetwork40Amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 48000
    },
    videoPaymentAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 10
    },
    videosPerDay: {
        type: DataTypes.INTEGER,
        defaultValue: 4
    },
    videoWatchTimeRequired: {
        type: DataTypes.INTEGER,
        defaultValue: 8
    },
    frontendDisabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tasksDisabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    salaryWallet: {
        type: DataTypes.ENUM('income', 'personal'),
        defaultValue: 'income'
    },
    taskWallet: {
        type: DataTypes.ENUM('income', 'personal'),
        defaultValue: 'income'
    },
    commissionWallet: {
        type: DataTypes.ENUM('income', 'personal'),
        defaultValue: 'income'
    },
    rankUpgradeRefundWallet: {
        type: DataTypes.ENUM('income', 'personal'),
        defaultValue: 'personal'
    }
}, {
    sequelize,
    modelName: 'SystemSetting',
    tableName: 'system_settings'
});

module.exports = SystemSetting;
