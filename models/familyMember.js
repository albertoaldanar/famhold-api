import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';
import Family from './family.js';

const FamilyMember = sequelize.define('FamilyMember', {
  uniqueId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nationalities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  permits: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isMemberOfFamilyCouncil: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  isMemberOfInvestmentCommittee: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  taxAddress: DataTypes.STRING,
  taxIdentifier: DataTypes.STRING,
  taxRegime: DataTypes.STRING,
  licenceURL: DataTypes.STRING,
  birthCertificate: DataTypes.STRING,
});

FamilyMember.belongsTo(Family, { foreignKey: 'familyId' });
Family.hasMany(FamilyMember, { foreignKey: 'familyId' });

export default FamilyMember;
