"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const donorProfile_controller_1 = require("../controllers/donorProfile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticateToken);
router.post('/', donorProfile_controller_1.upsertDonorProfile); // Create or Update
router.get('/eligibility', donorProfile_controller_1.getDonorEligibility);
router.get('/history', donorProfile_controller_1.getDonorHistory);
exports.default = router;
