import Provider from '../models/provider.js';
import { encryptObject } from '../midlewares/jwt.js';

const generateUniqueId = (name) => {
  const namePart = name.slice(0, 3).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `${namePart}-${randomPart}`;
};

export const createProvider = async (req, res) => {
  const providerData = req.body;

  const requiredFields = ['name', 'company', 'number', 'email', 'phone', 'role', 'familyId'];
  for (const field of requiredFields) {
    if (!providerData[field] || typeof providerData[field] !== 'string') {
      return res.status(400).json({ message: `${field} is required and must be a valid string.` });
    }
  }

  try {
    const uniqueId = generateUniqueId(providerData.name);
    providerData.uniqueId = uniqueId;

    const encryptedData = encryptObject(providerData, ['familyId']);

    const createdProvider = await Provider.create(encryptedData);

    return res.status(201).json({
      message: 'Provider was created successfully.',
      provider: createdProvider,
    });
  } catch (error) {
    console.error('Error creating Provider:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A Provider with this unique ID already exists.' });
    }

    return res.status(500).json({
      message: 'Error creating Provider.',
      error: error.message,
    });
  }
};
