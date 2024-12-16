// Migration file
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add vfoId foreign key and uniqueId column to Users table
    await queryInterface.addColumn('Users', 'vfoId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'VFOs',
        key: 'id',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Users', 'uniqueId', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('Users', 'vfoId');
    await queryInterface.removeColumn('Users', 'uniqueId');
  },
};