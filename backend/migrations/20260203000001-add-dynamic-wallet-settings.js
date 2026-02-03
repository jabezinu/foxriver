'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('system_settings');
    
    const columnsToAdd = {
      salaryWallet: {
        type: Sequelize.ENUM('income', 'personal'),
        defaultValue: 'income'
      },
      taskWallet: {
        type: Sequelize.ENUM('income', 'personal'),
        defaultValue: 'income'
      },
      commissionWallet: {
        type: Sequelize.ENUM('income', 'personal'),
        defaultValue: 'income'
      },
      rankUpgradeRefundWallet: {
        type: Sequelize.ENUM('income', 'personal'),
        defaultValue: 'personal'
      }
    };

    for (const [columnName, attributes] of Object.entries(columnsToAdd)) {
      if (!tableInfo[columnName]) {
        await queryInterface.addColumn('system_settings', columnName, attributes);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const columnsToRemove = ['salaryWallet', 'taskWallet', 'commissionWallet', 'rankUpgradeRefundWallet'];
    for (const columnName of columnsToRemove) {
      await queryInterface.removeColumn('system_settings', columnName);
    }
  }
};
