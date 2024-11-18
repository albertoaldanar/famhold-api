import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import Family from './family.js';

const Provider = sequelize.define('Provider', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Provider.belongsTo(Family, { foreignKey: 'familyId' });
Family.hasMany(Provider, { foreignKey: 'familyId' });

export default Provider;
