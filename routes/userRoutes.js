import express from 'express';
import { createUser, validateUsers, getAllUsers } from '../controllers/usersController.js';
import { validateCode } from '../midlewares/mfa.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();
router.post('/validate-code', validateCode);

router.post('/createUser', verifyToken(["accountManager"]), createUser);
router.get('/login', validateUsers);

export default router;
