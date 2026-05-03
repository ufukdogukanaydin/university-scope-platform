import { Router } from 'express';
import { applyForProject, respondToApplication } from '../controllers/application.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { applyToProjectSchema, updateApplicationStatusSchema } from '../validators/application.validator';

const router = Router();

router.use(verifyToken);

// Only students can submit applications
router.post('/apply', requireRole(['STUDENT']), validate(applyToProjectSchema), applyForProject);
// Project owner (any authenticated user) responds to applications — ownership is validated in controller
router.put('/:applicationId/respond', validate(updateApplicationStatusSchema), respondToApplication);

export default router;
