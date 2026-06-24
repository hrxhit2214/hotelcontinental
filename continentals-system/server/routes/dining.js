const express = require('express');
const router = express.Router();
const { getMenu, placeOrder, getOrders, updateOrderStatus } = require('../controllers/diningController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/menu', getMenu);
router.post('/order', authMiddleware, placeOrder);
router.get('/orders', authMiddleware, getOrders);
router.put('/orders/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

module.exports = router;
