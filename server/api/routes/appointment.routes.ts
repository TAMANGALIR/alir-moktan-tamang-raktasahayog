import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { createAppointment, getMyAppointments, updateAppointmentStatus, getBookingOptions, getOrgAppointments } from '../controllers/appointment.controller';

const router = express.Router();

router.use(authenticateToken); // Protect all routes

router.get('/booking-options', getBookingOptions);
router.get('/org-requests', getOrgAppointments);
router.post('/', createAppointment);
router.get('/', getMyAppointments);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
