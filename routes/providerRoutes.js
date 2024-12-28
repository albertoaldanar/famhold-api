import express from 'express';
import { createProvider } from '../controllers/providerController.js';
import { verifyToken } from '../midlewares/jwt.js';
const router = express.Router();

router.post('/createProvider', verifyToken(['vfoUser']), createProvider);

export default router;
