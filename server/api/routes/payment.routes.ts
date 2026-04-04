import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import {
    initiatePayment,
    verifyEsewaPayment,
    refundPayment,
    cancelCampaign,
    getPaymentStatus,
    initiateDonation,
    verifyDonationPayment
} from '../controllers/payment.controller';

const router = express.Router();

// Initiate Payment (Organization Only)
router.post('/initiate/:campaignId', authenticateToken, authorizeRoles('ORGANIZATION'), initiatePayment);

// eSewa Payment Verification Callback (Public - called by redirect)
router.get('/esewa/verify', verifyEsewaPayment);

// Cancel Campaign with Refund (Organization Only)
router.post('/cancel/:campaignId', authenticateToken, authorizeRoles('ORGANIZATION'), cancelCampaign);

// Refund (Organization Only)
router.post('/refund/:campaignId', authenticateToken, authorizeRoles('ORGANIZATION'), refundPayment);

// Payment Status
router.get('/status/:campaignId', authenticateToken, getPaymentStatus);

// ─── USER DONATIONS ──────────────────────────────────────────────────
router.post('/donate/:campaignId', authenticateToken, initiateDonation);
router.get('/esewa/verify-donation', verifyDonationPayment);

export default router;
