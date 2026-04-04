"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma_service_1 = __importDefault(require("../services/prisma.service"));
const router = (0, express_1.Router)();
// Auth Routes
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.post('/verify-otp', authController_1.verifyOtp);
router.post('/resend-otp', authController_1.resendOtp);
router.post('/refresh-token', authController_1.refreshToken);
router.get('/verify-email/:token', authController_1.verifyEmail); // Legacy
// Get Current User
router.get('/me', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await prisma_service_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                donorProfile: true, // helpful for frontend
                adminProfile: true
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
