"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const emergency_controller_1 = require("../controllers/emergency.controller");
const router = express_1.default.Router();
// Organization routes
router.post('/', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), emergency_controller_1.createEmergencyRequest);
router.get('/my-requests', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), emergency_controller_1.getMyEmergencyRequests);
router.patch('/:id/status', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), emergency_controller_1.updateEmergencyStatus);
router.post('/:id/rebroadcast', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)('ORGANIZATION'), emergency_controller_1.rebroadcastEmergency);
// User routes
router.get('/active', auth_middleware_1.authenticateToken, emergency_controller_1.getActiveEmergencies);
router.post('/:id/respond', auth_middleware_1.authenticateToken, emergency_controller_1.respondToEmergency);
exports.default = router;
