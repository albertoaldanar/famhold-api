import express from 'express';
import { createUser, validateUsers, getAllUsers } from '../controllers/usersController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/createUser', verifyToken, createUser);
router.get('/login', validateUsers);
router.get('/getUsers', verifyToken, getAllUsers);

export default router;
