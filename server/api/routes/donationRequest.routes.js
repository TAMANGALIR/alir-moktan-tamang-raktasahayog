"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donationRequest_controller_1 = require("../controllers/donationRequest.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.post('/', donationRequest_controller_1.createRequest);
router.get('/my', donationRequest_controller_1.getMyRequests);
// Admin Routes
router.get('/admin/all', (0, auth_middleware_1.authorizeRoles)('ADMIN'), donationRequest_controller_1.getRequestsForAdmin);
router.put('/:id/status', (0, auth_middleware_1.authorizeRoles)('ADMIN'), donationRequest_controller_1.updateRequestStatus);
exports.default = router;
