"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const campaign_controller_1 = require("../controllers/campaign.controller");
const router = express_1.default.Router();
// Public Routes
router.get('/public', campaign_controller_1.getPublicCampaigns);
router.get('/public/:id', campaign_controller_1.getPublicCampaignById);
// Organization Routes
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), upload_middleware_1.upload.fields([
    { name: 'permit', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), campaign_controller_1.createCampaign);
router.get('/my-campaigns', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), campaign_controller_1.getOrgCampaigns);
router.put('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), upload_middleware_1.upload.fields([
    { name: 'permit', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), campaign_controller_1.updateCampaign);
router.get('/:id/details', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), campaign_controller_1.getCampaignDetails);
router.delete('/:id', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), campaign_controller_1.deleteCampaign);
router.patch('/:id/registrations/:registrationId', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), campaign_controller_1.updateRegistrationStatus);
router.post('/:id/registrations/guest', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), campaign_controller_1.registerGuest);
// Admin Routes
router.get('/admin/all', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), campaign_controller_1.getAllCampaignsForAdmin);
router.patch('/:id/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ADMIN'), campaign_controller_1.updateCampaignStatus);
// User Routes
const campaign_controller_2 = require("../controllers/campaign.controller");
router.post('/:id/register', auth_middleware_1.authenticateToken, campaign_controller_2.registerForCampaign);
router.get('/:id/registration-status', auth_middleware_1.authenticateToken, campaign_controller_2.checkRegistrationStatus);
exports.default = router;
