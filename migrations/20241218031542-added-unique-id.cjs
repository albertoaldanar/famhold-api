'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add uniqueId column to Providers table
    await queryInterface.addColumn('Providers', 'uniqueId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    // Add uniqueId column to FamilyMembers table
    await queryInterface.addColumn('FamilyMembers', 'uniqueId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove uniqueId column from Providers table
    await queryInterface.removeColumn('Providers', 'uniqueId');

    // Remove uniqueId column from FamilyMembers table
    await queryInterface.removeColumn('FamilyMembers', 'uniqueId');
  },
};
