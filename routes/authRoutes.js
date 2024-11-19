import express from 'express';
import { validateCode } from '../midlewares/mfa.js';

const router = express.Router();
router.post('/validate-code', validateCode);

export default router;
