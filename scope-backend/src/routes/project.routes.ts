import { Router } from 'express';
import { createProject, getAllProjects, getMyProjects } from '../controllers/project.controller';
import { verifyToken, requireRole } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createProjectSchema } from '../validators/project.validator';

const router = Router();

router.use(verifyToken);

router.post('/', requireRole(['STUDENT']), validate(createProjectSchema), createProject);
router.get('/', requireRole(['STUDENT', 'INSTRUCTOR', 'ADMIN']), getAllProjects);
router.get('/my-projects', requireRole(['STUDENT']), getMyProjects);

export default router;
