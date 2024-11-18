import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const FamholdAdmin = sequelize.define('FamholdAdmin', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  permittedDevices: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
});

export default FamholdAdmin;
