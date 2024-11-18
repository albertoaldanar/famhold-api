import sequelize from '../database/database.js';
import { DataTypes } from 'sequelize';
import AccountManager from './accountManager.js';
import Family from './family.js';

const VFO = sequelize.define('VFO', {
  isVfoON: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

VFO.belongsTo(Family, { foreignKey: 'familyId' });
Family.hasOne(VFO, { foreignKey: 'familyId' });

VFO.belongsTo(AccountManager, { foreignKey: 'accountManagerId', onDelete: 'SET NULL' });
AccountManager.hasMany(VFO, { foreignKey: 'accountManagerId' });

export default VFO;
