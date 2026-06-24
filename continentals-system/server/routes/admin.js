const express = require('express');
const router = express.Router();
const { getDashboard, getReceipts, generateReceipt } = require('../controllers/receiptController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/dashboard', authMiddleware, adminMiddleware, getDashboard);
router.get('/receipts', authMiddleware, adminMiddleware, getReceipts);
router.post('/receipts/generate', authMiddleware, adminMiddleware, generateReceipt);

module.exports = router;
