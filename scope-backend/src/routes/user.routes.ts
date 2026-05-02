import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { getMyProfile, updateProfile } from '../controllers/user.controller';

const router = Router();

router.use(verifyToken);

router.get('/me', getMyProfile);
router.put('/me', updateProfile);

export default router;
