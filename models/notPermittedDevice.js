import sequelize from '../database/database.js';
import { DataTypes } from 'sequelize';
import User from './user.js';

const NotPermittedDevice = sequelize.define('NotPermittedDevice', {
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
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastLoginAttempt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceInfo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

NotPermittedDevice.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(NotPermittedDevice, { foreignKey: 'userId' });

export default NotPermittedDevice;
