import { Router } from 'express';
import { registerOrganization, getAllOrgs, verifyOrganization, getDashboardStats } from '../controllers/admin.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public: Register Organization (Hospital/Blood Bank)
router.post('/register-org', upload.single('license'), registerOrganization);

// Protected: Super Admin Operations
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN')); // Only Admins can verify

router.get('/organizations', getAllOrgs);
router.post('/verify/:id', verifyOrganization);
router.get('/dashboard-stats', getDashboardStats);

export default router;
