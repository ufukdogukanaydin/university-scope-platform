import { Router } from 'express';
import { applyForProject, respondToApplication } from '../controllers/application.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

// Only students can submit applications
router.post('/apply', requireRole(['STUDENT']), applyForProject);
// Project owner (any authenticated user) responds to applications — ownership is validated in controller
router.put('/:applicationId/respond', respondToApplication);

export default router;
