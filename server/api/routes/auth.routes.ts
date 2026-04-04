import { Router } from 'express';
import { register, login, verifyOtp, resendOtp, refreshToken, verifyEmail } from '../controllers/authController';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../services/prisma.service';

const router = Router();

// Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail); // Legacy

// Get Current User
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
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
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
