const express = require('express');
const router = express.Router();
const { getPricing, setOverride, removeOverride, updateConfig } = require('../controllers/pricingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getPricing);
router.post('/override', authMiddleware, adminMiddleware, setOverride);
router.delete('/override/:roomType', authMiddleware, adminMiddleware, removeOverride);
router.put('/config', authMiddleware, adminMiddleware, updateConfig);

module.exports = router;
