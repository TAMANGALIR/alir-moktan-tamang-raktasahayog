"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const router = express_1.default.Router();
// Initiate Payment (Organization Only)
router.post('/initiate/:campaignId', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), payment_controller_1.initiatePayment);
// eSewa Payment Verification Callback (Public - called by redirect)
router.get('/esewa/verify', payment_controller_1.verifyEsewaPayment);
// Cancel Campaign with Refund (Organization Only)
router.post('/cancel/:campaignId', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), payment_controller_1.cancelCampaign);
// Refund (Organization Only)
router.post('/refund/:campaignId', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), payment_controller_1.refundPayment);
// Payment Status
router.get('/status/:campaignId', auth_middleware_1.authenticateToken, payment_controller_1.getPaymentStatus);
// ─── USER DONATIONS ──────────────────────────────────────────────────
router.post('/donate/:campaignId', auth_middleware_1.authenticateToken, payment_controller_1.initiateDonation);
router.get('/esewa/verify-donation', payment_controller_1.verifyDonationPayment);
exports.default = router;
