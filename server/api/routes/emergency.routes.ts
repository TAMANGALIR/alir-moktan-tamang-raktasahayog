import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import {
    createEmergencyRequest,
    getActiveEmergencies,
    respondToEmergency,
    getMyEmergencyRequests,
    updateEmergencyStatus,
    rebroadcastEmergency
} from '../controllers/emergency.controller';

const router = express.Router();

// Organization routes
router.post('/', authenticateToken, authorizeRoles('ORGANIZATION'), createEmergencyRequest);
router.get('/my-requests', authenticateToken, authorizeRoles('ORGANIZATION'), getMyEmergencyRequests);
router.patch('/:id/status', authenticateToken, authorizeRoles('ORGANIZATION'), updateEmergencyStatus);
router.post('/:id/rebroadcast', authenticateToken, authorizeRoles('ORGANIZATION'), rebroadcastEmergency);

// User routes
router.get('/active', authenticateToken, getActiveEmergencies);
router.post('/:id/respond', authenticateToken, respondToEmergency);

export default router;
