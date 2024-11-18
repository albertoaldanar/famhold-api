import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

export const Family = sequelize.define('Family', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  familyId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Family;
