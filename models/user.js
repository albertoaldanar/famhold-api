import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import FamilyMember from './familyMember.js';
import Provider from './provider.js';

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
  isAccountOn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  familyTokenRevealPassword: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('FamilyMember', 'Provider'),
    allowNull: false,
  },
  permittedDevices: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  linkedUser: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
});

User.belongsTo(FamilyMember, { foreignKey: 'linkedFamilyMemberId', as: 'familyMember' });
User.belongsTo(Provider, { foreignKey: 'linkedProviderId', as: 'provider' });

export default User;
