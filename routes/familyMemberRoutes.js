import express from 'express';
import { createFamilyMember } from '../controllers/familyMemberController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/createFamilyMember', verifyToken(['vfoUser']), createFamilyMember);

export default router;
