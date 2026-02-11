import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
    createCampaign,
    getOrgCampaigns,
    updateCampaign,
    deleteCampaign,
    getAllCampaignsForAdmin,
    updateCampaignStatus,
    getPublicCampaigns,
    getCampaignDetails,
    updateRegistrationStatus,
    registerGuest
} from '../controllers/campaign.controller';

const router = express.Router();

// Public Routes
router.get('/public', getPublicCampaigns);

// Organization Routes
router.post('/', authenticateToken, authorizeRoles('ORGANIZATION'), upload.fields([
    { name: 'permit', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), createCampaign);
router.get('/my-campaigns', authenticateToken, authorizeRoles('ORGANIZATION'), getOrgCampaigns);
router.put('/:id', authenticateToken, authorizeRoles('ORGANIZATION'), upload.fields([
    { name: 'permit', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), updateCampaign);
router.get('/:id/details', authenticateToken, authorizeRoles('ORGANIZATION'), getCampaignDetails);
router.delete('/:id', authenticateToken, authorizeRoles('ORGANIZATION'), deleteCampaign);
router.patch('/:id/registrations/:registrationId', authenticateToken, authorizeRoles('ORGANIZATION'), updateRegistrationStatus);
router.post('/:id/registrations/guest', authenticateToken, authorizeRoles('ORGANIZATION'), registerGuest);

// Admin Routes
router.get('/admin/all', authenticateToken, authorizeRoles('ADMIN'), getAllCampaignsForAdmin);
router.patch('/:id/status', authenticateToken, authorizeRoles('ADMIN'), updateCampaignStatus);

// User Routes
import { registerForCampaign, checkRegistrationStatus } from '../controllers/campaign.controller';
router.post('/:id/register', authenticateToken, registerForCampaign);
router.get('/:id/registration-status', authenticateToken, checkRegistrationStatus);

export default router;
