import express from 'express';
import { createFamholdAdmin, validateFamholdAdmin } from '../controllers/famholdAdminController.js';

const router = express.Router();

router.post('/createFamholdAdmin', createFamholdAdmin);
router.post('/validateFamholdAdmin', validateFamholdAdmin);

export default router;
