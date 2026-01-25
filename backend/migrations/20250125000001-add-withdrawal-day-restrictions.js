'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new column for day-based restrictions
    await queryInterface.addColumn('users', 'withdrawalRestrictedDays', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of day numbers (0=Sunday, 1=Monday, etc.) when withdrawals are restricted'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'withdrawalRestrictedDays');
  }
};