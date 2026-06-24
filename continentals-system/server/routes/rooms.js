const express = require('express');
const router = express.Router();
const { getRooms, getRoomById, bookRoom, updateRoomStatus } = require('../controllers/roomController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/book', authMiddleware, bookRoom);
router.put('/:id/status', authMiddleware, adminMiddleware, updateRoomStatus);

module.exports = router;
