import express from 'express';
import { createFamholdAdmin, validateFamholdAdmin, validateCodeFamholdAdmin } from '../controllers/famholdAdminController.js';
import { verifyToken } from '../midlewares/jwt.js';
const router = express.Router();

router.post('/createFamholdAdmin', verifyToken(['famholdAdmin']), createFamholdAdmin);
router.post('/validateFamholdAdmin', verifyToken(['famholdAdmin']), validateFamholdAdmin);
router.post('/validateCodeFamholdAdmin', verifyToken(['famholdAdmin']), validateCodeFamholdAdmin);

export default router;
