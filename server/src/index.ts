import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config(); // Load env vars before any other imports

import authRoutes from './routes/auth.routes';
import userProfileRoutes from './routes/userProfile.routes';
import donorProfileRoutes from './routes/donorProfile.routes';

import cors from 'cors';

dotenv.config();

import { createServer } from 'http';
import { initSocket } from './utils/socket.utils';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
initSocket(httpServer);

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// CORS configuration (Express)
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

import { checkAndCompleteCampaigns } from './controllers/campaign.controller';

// Auto-Complete Job (Run every hour)
setInterval(() => {
    console.log('Running Auto-Complete Job...');
    checkAndCompleteCampaigns();
}, 60 * 60 * 1000);

// Run once on startup
checkAndCompleteCampaigns();

// Routes
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Blood Donation Server API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            userProfile: '/api/users/profile',
            donorProfile: '/api/donors/profile',
            adminProfile: '/api/admins/profile',
            donationRequests: '/api/donation-requests',
        }
    });
});

// Active Routes
import donationRequestRoutes from './routes/donationRequest.routes';
import inventoryRoutes from './routes/inventory.routes';
import adminRoutes from './routes/admin.routes';
import campaignRoutes from './routes/campaign.routes';
import emergencyRoutes from './routes/emergency.routes';
import appointmentRoutes from './routes/appointment.routes';
import paymentRoutes from './routes/payment.routes';


// ... existing routes ...
app.use('/api/auth', authRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api/donor', donorProfileRoutes);
app.use('/api/donation-request', donationRequestRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin', adminRoutes); // Admin & Org Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);


// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
