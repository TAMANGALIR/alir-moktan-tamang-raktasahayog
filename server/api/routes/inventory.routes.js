"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.use((0, auth_middleware_1.authorizeRoles)('ADMIN', 'ORGANIZATION')); // Allow both Admin and Org users
router.get('/', inventory_controller_1.getMyRegionInventory);
router.get('/:bloodGroup', inventory_controller_1.getInventoryDetails);
router.post('/donation', inventory_controller_1.addDonation); // Record new individual donation
router.post('/update', inventory_controller_1.updateInventory); // Manual stock correction
router.post('/use', inventory_controller_1.markUnitAsUsed); // Usage tracking
exports.default = router;
