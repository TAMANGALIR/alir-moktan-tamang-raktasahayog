import express from 'express';
import { upsertDonorProfile, getDonorEligibility, getDonorHistory } from '../controllers/donorProfile.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticateToken);

router.post('/', upsertDonorProfile); // Create or Update
router.get('/eligibility', getDonorEligibility);
router.get('/history', getDonorHistory);

export default router;
