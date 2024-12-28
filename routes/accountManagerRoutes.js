import express from 'express';
import {
  createAccountManager,
  validateAccountManager,
  validateCodeAccountManager,
} from '../controllers/accountManagerController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/createAccountManager', verifyToken(['famholdAdmin']), createAccountManager);
router.post('/loginAccountManager', validateAccountManager);
router.post('/validateCodeAccountManager', validateCodeAccountManager);

export default router;
