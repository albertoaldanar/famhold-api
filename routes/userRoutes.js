import express from 'express';
import { createUser, validateUsers, getAllUsers } from '../controllers/usersController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/createUser', verifyToken(["accountManager"]), createUser);
router.post('/loginVfoUser', validateUsers);

export default router;
