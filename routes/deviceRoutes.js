import express from 'express';
import {
  acceptNotPermittedDevice,
  validateDeviceAfterCorrectCredentials,
} from '../controllers/deviceController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/acceptNotPermittedDevice', verifyToken(['famholdAdmin']), acceptNotPermittedDevice);
router.post('/validateDeviceAfterCorrectCredentials', verifyToken(['famholdAdmin']), validateDeviceAfterCorrectCredentials);

export default router;
