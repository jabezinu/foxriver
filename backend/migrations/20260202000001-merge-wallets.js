'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Transfer balances from tasksWallet to incomeWallet
    await queryInterface.sequelize.query(
      'UPDATE users SET incomeWallet = incomeWallet + tasksWallet'
    );

    // 2. Remove the tasksWallet column
    await queryInterface.removeColumn('users', 'tasksWallet');
  },

  down: async (queryInterface, Sequelize) => {
    // Rolling back this change is tricky because we lost the separation of funds.
    // We can add the column back, but we can't easily restore the original tasksWallet balances.
    await queryInterface.addColumn('users', 'tasksWallet', {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0
    });
  }
};
