const express = require('express');
const router = express.Router();
const { getSlots, reserveSlot, releaseSlot } = require('../controllers/parkingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getSlots);
router.post('/reserve', authMiddleware, reserveSlot);
router.put('/:id/release', authMiddleware, releaseSlot);

module.exports = router;
