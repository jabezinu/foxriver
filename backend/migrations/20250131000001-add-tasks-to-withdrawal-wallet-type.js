'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // For MySQL/MariaDB, we need to alter the ENUM type
    await queryInterface.sequelize.query(`
      ALTER TABLE withdrawals 
      MODIFY COLUMN walletType ENUM('income', 'personal', 'tasks') NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to original ENUM values
    await queryInterface.sequelize.query(`
      ALTER TABLE withdrawals 
      MODIFY COLUMN walletType ENUM('income', 'personal') NOT NULL;
    `);
  }
};
