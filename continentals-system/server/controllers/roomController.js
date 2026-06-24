const pool = require('../config/database');

const getPricingConfigAndOverrides = async () => {
  const configRes = await pool.query('SELECT * FROM pricing_config LIMIT 1');
  const overridesRes = await pool.query('SELECT * FROM pricing_overrides');
  
  const config = configRes.rows[0] || { enabled: true, thresholds: [] };
  const overrides = {};
  overridesRes.rows.forEach(row => {
    overrides[row.room_type] = row.price;
  });
  
  return { config, overrides };
};

const calculateDynamicPrice = async (room, config, overrides, occupancyRate) => {
  if (!config.enabled) return room.base_price;

  const override = overrides[room.type] || overrides[room.id];
  if (override) return override;

  let multiplier = 1;
  const thresholds = typeof config.thresholds === 'string' ? JSON.parse(config.thresholds) : config.thresholds;
  
  if (thresholds && Array.isArray(thresholds)) {
    for (const threshold of thresholds) {
      if (occupancyRate >= threshold.occupancy) {
        multiplier = threshold.multiplier;
        break;
      }
    }
  }

  return Math.round(room.base_price * multiplier);
};

const getRooms = async (req, res) => {
  const { type, guests } = req.query;

  try {
    let query = 'SELECT * FROM rooms';
    const params = [];
    let conditions = [];

    if (type && type !== 'all') {
      params.push(type);
      conditions.push(`type = $${params.length}`);
    }

    if (guests) {
      params.push(parseInt(guests));
      conditions.push(`capacity >= $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ' ORDER BY id';

    const [roomsRes, statsRes, pricingData] = await Promise.all([
      pool.query(query, params),
      pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked
        FROM rooms
      `),
      getPricingConfigAndOverrides()
    ]);

    const stats = statsRes.rows[0];
    const totalRooms = parseInt(stats.total) || 0;
    const bookedRooms = parseInt(stats.booked) || 0;
    const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

    const roomsWithPrices = await Promise.all(roomsRes.rows.map(async room => ({
      ...room,
      basePrice: room.base_price,
      currentPrice: await calculateDynamicPrice(room, pricingData.config, pricingData.overrides, occupancyRate)
    })));

    res.json({
      rooms: roomsWithPrices,
      stats: {
        total: totalRooms,
        available: totalRooms - bookedRooms,
        booked: bookedRooms,
        occupancyRate
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching rooms.' });
  }
};

const getRoomById = async (req, res) => {
  try {
    const roomRes = await pool.query('SELECT * FROM rooms WHERE id = $1', [req.params.id]);
    if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found.' });

    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked
      FROM rooms
    `);
    const stats = statsRes.rows[0];
    const occupancyRate = stats.total > 0 ? Math.round((stats.booked / stats.total) * 100) : 0;

    const pricingData = await getPricingConfigAndOverrides();
    const room = roomRes.rows[0];
    
    res.json({
      ...room,
      basePrice: room.base_price,
      currentPrice: await calculateDynamicPrice(room, pricingData.config, pricingData.overrides, occupancyRate)
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching room details.' });
  }
};

const bookRoom = async (req, res) => {
  const { roomId, checkIn, checkOut, guests } = req.body;
  const userId = req.user.id;

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'Room ID, check-in, and check-out dates are required.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get room with lock
    const roomRes = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [roomId]);
    if (roomRes.rows.length === 0) throw new Error('Room not found.');
    
    const room = roomRes.rows[0];
    if (room.status === 'booked') throw new Error('Room is already booked.');

    // Calculate dynamic price
    const statsRes = await client.query(`
      SELECT COUNT(*) as total, SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked FROM rooms
    `);
    const occupancyRate = Math.round((statsRes.rows[0].booked / statsRes.rows[0].total) * 100) || 0;
    const pricingData = await getPricingConfigAndOverrides();
    const pricePerNight = await calculateDynamicPrice(room, pricingData.config, pricingData.overrides, occupancyRate);

    const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
    const totalPrice = pricePerNight * nights;

    // Update room
    await client.query(
      'UPDATE rooms SET status = $1, booked_by = $2, check_in = $3, check_out = $4 WHERE id = $5',
      ['booked', userId, checkIn, checkOut, roomId]
    );

    // Create booking
    const bookingRes = await client.query(
      `INSERT INTO bookings 
      (user_id, room_id, room_number, room_type, room_name, check_in, check_out, guests, nights, price_per_night, total_price, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [userId, room.id, room.number, room.type, room.name, checkIn, checkOut, guests || 1, nights, pricePerNight, totalPrice, 'confirmed']
    );

    await client.query('COMMIT');
    res.status(201).json({ booking: bookingRes.rows[0], message: 'Room booked successfully!' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message || 'Database error during booking.' });
  } finally {
    client.release();
  }
};

const updateRoomStatus = async (req, res) => {
  const { status } = req.body;
  const roomId = req.params.id;

  try {
    const roomRes = await pool.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Room not found.' });

    let updateQuery = 'UPDATE rooms SET status = $1';
    let params = [status, roomId];

    if (status === 'available') {
      updateQuery += ', booked_by = NULL, check_in = NULL, check_out = NULL';
    }

    updateQuery += ' WHERE id = $2 RETURNING *';

    const result = await pool.query(updateQuery, params);
    res.json({ room: result.rows[0], message: 'Room status updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Database error updating room status.' });
  }
};

module.exports = { getRooms, getRoomById, bookRoom, updateRoomStatus, calculateDynamicPrice };
