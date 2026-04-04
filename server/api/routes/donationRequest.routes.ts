import { Router } from 'express';
import { createRequest, getRequestsForAdmin, getMyRequests, updateRequestStatus } from '../controllers/donationRequest.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createRequest);
router.get('/my', getMyRequests);

// Admin Routes
router.get('/admin/all', authorizeRoles('ADMIN'), getRequestsForAdmin);
router.put('/:id/status', authorizeRoles('ADMIN'), updateRequestStatus);

export default router;
