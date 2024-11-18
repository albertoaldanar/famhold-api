import express from 'express';
import { createFamily, getFamilyData } from '../controllers/familyController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/createFamily', verifyToken, createFamily);
router.get('/family/:id', verifyToken, getFamilyData);

export default router;