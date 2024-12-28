import express from 'express';
import { createUser, validateUsers, getAllUsers, updateUserAccount, resetUserPasswords, customizeUserCredentials } from '../controllers/usersController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/createUser', verifyToken(["accountManager"]), createUser);
router.post('/loginVfoUser', validateUsers);
router.get('/getAllUsers', verifyToken(["accountManager"]), getAllUsers);
router.put('/updateUserAccount', verifyToken(["accountManager"]), updateUserAccount);
router.put('/resetUserPasswords', verifyToken(["accountManager"]), resetUserPasswords);
router.put('/customizeUserCredentials', verifyToken(["userVFO"]), customizeUserCredentials);

export default router;
