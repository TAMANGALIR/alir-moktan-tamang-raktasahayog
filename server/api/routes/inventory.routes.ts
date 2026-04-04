import { Router } from 'express';
import { getMyRegionInventory, updateInventory, addDonation, getInventoryDetails, markUnitAsUsed } from '../controllers/inventory.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'ORGANIZATION')); // Allow both Admin and Org users

router.get('/', getMyRegionInventory);
router.get('/:bloodGroup', getInventoryDetails);
router.post('/donation', addDonation); // Record new individual donation
router.post('/update', updateInventory); // Manual stock correction
router.post('/use', markUnitAsUsed); // Usage tracking

export default router;
