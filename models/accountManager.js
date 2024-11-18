import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const AccountManager = sequelize.define('AccountManager', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  permittedDevices: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default AccountManager;
