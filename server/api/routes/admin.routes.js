"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Public: Register Organization (Hospital/Blood Bank)
router.post('/register-org', upload_middleware_1.upload.single('license'), admin_controller_1.registerOrganization);
// Protected: Super Admin Operations
router.use(auth_middleware_1.authenticateToken);
router.use((0, auth_middleware_1.authorizeRoles)('ADMIN')); // Only Admins can verify
router.get('/organizations', admin_controller_1.getAllOrgs);
router.post('/verify/:id', admin_controller_1.verifyOrganization);
router.get('/dashboard-stats', admin_controller_1.getDashboardStats);
exports.default = router;
