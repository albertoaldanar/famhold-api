import sequelize from '../database/database.js';
import { DataTypes } from 'sequelize';
import User from './user.js';

const PermittedDevice = sequelize.define('PermittedDevice', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  deviceFingerprint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastLogin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceInfo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

PermittedDevice.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(PermittedDevice, { foreignKey: 'userId' });

export default PermittedDevice;
