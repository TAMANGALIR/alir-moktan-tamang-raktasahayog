"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load env vars before any other imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const userProfile_routes_1 = __importDefault(require("./routes/userProfile.routes"));
const donorProfile_routes_1 = __importDefault(require("./routes/donorProfile.routes"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const http_1 = require("http");
const socket_utils_1 = require("./utils/socket.utils");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3000;
// Initialize Socket.io
(0, socket_utils_1.initSocket)(httpServer);
// Middleware
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static('uploads'));
// CORS configuration (Express)
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
const campaign_controller_1 = require("./controllers/campaign.controller");
// Auto-Complete Job (Run every hour)
setInterval(() => {
    console.log('Running Auto-Complete Job...');
    (0, campaign_controller_1.checkAndCompleteCampaigns)();
}, 60 * 60 * 1000);
// Run once on startup
(0, campaign_controller_1.checkAndCompleteCampaigns)();
// Routes
app.get('/', (req, res) => {
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
const donationRequest_routes_1 = __importDefault(require("./routes/donationRequest.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const campaign_routes_1 = __importDefault(require("./routes/campaign.routes"));
const emergency_routes_1 = __importDefault(require("./routes/emergency.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
// ... existing routes ...
app.use('/api/auth', auth_routes_1.default);
app.use('/api/user', userProfile_routes_1.default);
app.use('/api/donor', donorProfile_routes_1.default);
app.use('/api/donation-request', donationRequest_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/admin', admin_routes_1.default); // Admin & Org Routes
app.use('/api/campaigns', campaign_routes_1.default);
app.use('/api/emergency', emergency_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
