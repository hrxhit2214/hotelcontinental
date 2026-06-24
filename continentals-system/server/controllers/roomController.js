const data = require('../data/seed');

let nextBookingId = data.bookings.length + 1;

// Calculate dynamic pricing based on occupancy
const calculateDynamicPrice = (room) => {
  if (!data.pricingConfig.enabled) return room.basePrice;

  // Check for manual override
  const override = data.pricingOverrides[room.type] || data.pricingOverrides[room.id];
  if (override) return override;

  const totalRooms = data.rooms.length;
  const bookedRooms = data.rooms.filter(r => r.status === 'booked').length;
  const occupancyRate = (bookedRooms / totalRooms) * 100;

  let multiplier = 1;
  for (const threshold of data.pricingConfig.thresholds) {
    if (occupancyRate >= threshold.occupancy) {
      multiplier = threshold.multiplier;
      break;
    }
  }

  return Math.round(room.basePrice * multiplier);
};

const getRooms = (req, res) => {
  const { type, checkIn, checkOut, guests } = req.query;

  let filtered = data.rooms.map(room => ({
    ...room,
    currentPrice: calculateDynamicPrice(room)
  }));

  if (type && type !== 'all') {
    filtered = filtered.filter(r => r.type === type);
  }

  if (guests) {
    filtered = filtered.filter(r => r.capacity >= parseInt(guests));
  }

  // Occupancy stats
  const totalRooms = data.rooms.length;
  const bookedRooms = data.rooms.filter(r => r.status === 'booked').length;
  const occupancyRate = Math.round((bookedRooms / totalRooms) * 100);

  res.json({
    rooms: filtered,
    stats: {
      total: totalRooms,
      available: totalRooms - bookedRooms,
      booked: bookedRooms,
      occupancyRate
    }
  });
};

const getRoomById = (req, res) => {
  const room = data.rooms.find(r => r.id === parseInt(req.params.id));
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  res.json({ ...room, currentPrice: calculateDynamicPrice(room) });
};

const bookRoom = (req, res) => {
  const { roomId, checkIn, checkOut, guests } = req.body;
  const userId = req.user.id;

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Room ID, check-in, and check-out dates are required.' });
  }

  const room = data.rooms.find(r => r.id === parseInt(roomId));
  if (!room) return res.status(404).json({ error: 'Room not found.' });
  if (room.status === 'booked') return res.status(400).json({ error: 'Room is already booked.' });

  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const pricePerNight = calculateDynamicPrice(room);
  const totalPrice = pricePerNight * nights;

  room.status = 'booked';
  room.bookedBy = userId;
  room.checkIn = checkIn;
  room.checkOut = checkOut;

  const booking = {
    id: nextBookingId++,
    userId,
    roomId: room.id,
    roomNumber: room.number,
    roomType: room.type,
    roomName: room.name,
    checkIn,
    checkOut,
    guests: guests || 1,
    nights,
    pricePerNight,
    totalPrice,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  data.bookings.push(booking);

  res.status(201).json({ booking, message: 'Room booked successfully!' });
};

const updateRoomStatus = (req, res) => {
  const { status } = req.body;
  const room = data.rooms.find(r => r.id === parseInt(req.params.id));
  if (!room) return res.status(404).json({ error: 'Room not found.' });

  room.status = status;
  if (status === 'available') {
    room.bookedBy = null;
    room.checkIn = null;
    room.checkOut = null;
  }

  res.json({ room, message: 'Room status updated.' });
};

module.exports = { getRooms, getRoomById, bookRoom, updateRoomStatus, calculateDynamicPrice };
