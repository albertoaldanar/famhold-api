import express from 'express';
import { 
  createFamily, 
  getFamilyData, 
  revealFamilyToken, 
  regenerateFamilyToken 
} from '../controllers/familyController.js';
import { verifyToken } from '../midlewares/jwt.js';

const router = express.Router();

router.post('/createFamily', verifyToken(['accountManager']), createFamily);
router.get('/family/:id', verifyToken(['vfoUser']), getFamilyData);
router.post('/revealFamilyToken', revealFamilyToken);
router.post('/regenerateFamilyToken', verifyToken(['accountManager']), regenerateFamilyToken);

export default router;
