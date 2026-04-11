import { Router } from 'express';
import { registerOrganization, getAllOrgs, verifyOrganization, getDashboardStats } from '../controllers/admin.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Public: Register Organization (Hospital/Blood Bank)
router.post('/organizations', (req, res, next) => { console.log('Hit /organizations'); next(); }, upload.single('license'), registerOrganization);
router.post('/register-org', (req, res, next) => { console.log('Hit /register-org'); next(); }, upload.single('license'), registerOrganization); // Alias for frontend

// Protected: Super Admin Operations
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN')); // Only Admins can verify

router.get('/organizations', getAllOrgs);
router.post('/verify/:id', verifyOrganization);
router.get('/dashboard-stats', getDashboardStats);

export default router;
