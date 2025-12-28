import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userProfile.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get('/', getUserProfile);
router.put('/', updateUserProfile);

export default router;
