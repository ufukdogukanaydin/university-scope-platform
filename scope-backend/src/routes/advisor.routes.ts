import { Router } from 'express';
import { sendAdvisorRequest, respondToAdvisorRequest } from '../controllers/advisor.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/request', requireRole(['STUDENT']), sendAdvisorRequest);
router.put('/:requestId/respond', requireRole(['INSTRUCTOR']), respondToAdvisorRequest);

export default router;
