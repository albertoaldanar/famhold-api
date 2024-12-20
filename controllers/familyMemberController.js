import FamilyMember from '../models/familyMember.js';
import { encryptObject } from '../middlewares/jwt.js';

const generateUniqueId = (name) => {
  const namePart = name.slice(0, 3).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${namePart}-${randomPart}`;
};

export const createFamilyMember = async (req, res) => {
  const familyMemberData = req.body;

  const requiredFields = ['name', 'gender', 'birthDate', 'familyId'];
  for (const field of requiredFields) {
    if (!familyMemberData[field] || typeof familyMemberData[field] !== 'string') {
      return res.status(400).json({ message: `${field} is required and must be a valid string.` });
    }
  }

  try {
    const uniqueId = generateUniqueId(familyMemberData.name);
    familyMemberData.uniqueId = uniqueId;

    const encryptedData = encryptObject(familyMemberData, [
      'isMemberOfFamilyCouncil',
      'isMemberOfInvestmentCommittee',
    ]);

    const createdFamilyMember = await FamilyMember.create(encryptedData);

    return res.status(201).json({
      message: 'Family Member was created successfully.',
      familyMember: createdFamilyMember,
    });
  } catch (error) {
    console.error('Error creating Family Member:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A Family Member with this unique ID already exists.' });
    }

    return res.status(500).json({
      message: 'Error creating Family Member.',
      error: error.message,
    });
  }
};
