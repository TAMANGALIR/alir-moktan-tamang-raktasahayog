"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticateToken); // Protect all routes
router.get('/booking-options', appointment_controller_1.getBookingOptions);
router.get('/org-requests', appointment_controller_1.getOrgAppointments);
router.post('/', appointment_controller_1.createAppointment);
router.get('/', appointment_controller_1.getMyAppointments);
router.patch('/:id/status', appointment_controller_1.updateAppointmentStatus);
exports.default = router;
