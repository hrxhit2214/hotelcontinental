const pool = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const [roomsStats, parkingStats, bookingsStats, ordersStats, recentBookings, recentOrders] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked FROM rooms`),
      pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied FROM parking_slots`),
      pool.query(`SELECT COUNT(*) as total, SUM(total_price) as revenue, SUM(CASE WHEN check_in = CURRENT_DATE THEN 1 ELSE 0 END) as today_checkins FROM bookings`),
      pool.query(`SELECT SUM(total_price) as revenue FROM food_orders`),
      pool.query(`SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5`),
      pool.query(`SELECT * FROM food_orders ORDER BY created_at DESC LIMIT 5`)
    ]);

    const rooms = roomsStats.rows[0];
    const parking = parkingStats.rows[0];
    const bookings = bookingsStats.rows[0];
    const orders = ordersStats.rows[0];

    const totalRooms = parseInt(rooms.total) || 0;
    const bookedRooms = parseInt(rooms.booked) || 0;
    
    const totalRoomRevenue = parseInt(bookings.revenue) || 0;
    const totalFoodRevenue = parseInt(orders.revenue) || 0;

    res.json({
      rooms: { 
        total: totalRooms, 
        booked: bookedRooms, 
        available: totalRooms - bookedRooms, 
        occupancyRate: totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0 
      },
      parking: { 
        total: parseInt(parking.total) || 0, 
        occupied: parseInt(parking.occupied) || 0, 
        available: (parseInt(parking.total) || 0) - (parseInt(parking.occupied) || 0) 
      },
      revenue: { 
        total: totalRoomRevenue + totalFoodRevenue, 
        rooms: totalRoomRevenue, 
        food: totalFoodRevenue 
      },
      bookings: { 
        total: parseInt(bookings.total) || 0, 
        todayCheckIns: parseInt(bookings.today_checkins) || 0 
      },
      recentBookings: recentBookings.rows,
      recentOrders: recentOrders.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching dashboard data.' });
  }
};

const getReceipts = async (req, res) => {
  const { type, search } = req.query;

  try {
    let transactions = [];

    // Room bookings
    if (!type || type === 'all' || type === 'rooms') {
      const bookingsQuery = `
        SELECT b.*, u.name as guest_name 
        FROM bookings b 
        LEFT JOIN users u ON b.user_id = u.id
      `;
      const bookings = await pool.query(bookingsQuery);
      transactions.push(...bookings.rows.map(b => ({
        id: \`ROOM-\${b.id}\`,
        type: 'room',
        guestName: b.guest_name || 'Unknown',
        description: \`Room \${b.room_number} (\${b.room_type}) — \${b.check_in.toISOString().split('T')[0]} to \${b.check_out.toISOString().split('T')[0]}\`,
        amount: parseInt(b.total_price),
        status: b.status,
        date: b.created_at
      })));
    }

    // Food orders
    if (!type || type === 'all' || type === 'food') {
      const ordersQuery = `
        SELECT o.*, u.name as guest_name 
        FROM food_orders o 
        LEFT JOIN users u ON o.user_id = u.id
      `;
      const orders = await pool.query(ordersQuery);
      
      for (const o of orders.rows) {
        const items = await pool.query('SELECT name FROM order_items WHERE order_id = $1', [o.id]);
        const itemNames = items.rows.map(i => i.name).join(', ');
        
        transactions.push({
          id: \`FOOD-\${o.id}\`,
          type: 'food',
          guestName: o.guest_name || 'Unknown',
          description: \`\${itemNames} — Room \${o.room_number || 'N/A'}\`,
          amount: parseInt(o.total_price),
          status: o.status,
          date: o.created_at
        });
      }
    }

    // Parking
    if (!type || type === 'all' || type === 'parking') {
      const parkingQuery = `
        SELECT p.*, u.name as guest_name 
        FROM parking_slots p 
        JOIN users u ON p.reserved_by = u.id 
        WHERE p.status = 'occupied'
      `;
      const parking = await pool.query(parkingQuery);
      transactions.push(...parking.rows.map(s => ({
        id: \`PARK-\${s.id}\`,
        type: 'parking',
        guestName: s.guest_name || 'Unknown',
        description: \`Slot #\${s.slot_number} — \${s.vehicle_plate || 'No plate'}\`,
        amount: 15,
        status: 'active',
        date: s.reserved_at
      })));
    }

    if (search) {
      const q = search.toLowerCase();
      transactions = transactions.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.guestName.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const revenueByType = {
      rooms: transactions.filter(t => t.type === 'room').reduce((sum, t) => sum + t.amount, 0),
      food: transactions.filter(t => t.type === 'food').reduce((sum, t) => sum + t.amount, 0),
      parking: transactions.filter(t => t.type === 'parking').reduce((sum, t) => sum + t.amount, 0)
    };

    res.json({ transactions, totalRevenue, revenueByType });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching receipts.' });
  }
};

const generateReceipt = async (req, res) => {
  const { guestId } = req.body;

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [guestId]);
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Guest not found.' });
    const user = userRes.rows[0];

    const [bookingsRes, ordersRes, parkingRes] = await Promise.all([
      pool.query('SELECT * FROM bookings WHERE user_id = $1', [guestId]),
      pool.query('SELECT * FROM food_orders WHERE user_id = $1', [guestId]),
      pool.query('SELECT * FROM parking_slots WHERE reserved_by = $1', [guestId])
    ]);

    const guestBookings = bookingsRes.rows;
    const guestOrders = ordersRes.rows;
    const guestParking = parkingRes.rows;

    const roomCharges = guestBookings.reduce((sum, b) => sum + parseInt(b.total_price), 0);
    const foodCharges = guestOrders.reduce((sum, o) => sum + parseInt(o.total_price), 0);
    const parkingCharges = guestParking.length * 15;
    const grandTotal = roomCharges + foodCharges + parkingCharges;

    const receipt = {
      receiptId: \`RCP-\${Date.now()}\`,
      generatedAt: new Date().toISOString(),
      guest: { name: user.name, email: user.email },
      lineItems: {
        rooms: guestBookings.map(b => ({
          description: \`Room \${b.room_number} (\${b.room_type}) — \${b.check_in.toISOString().split('T')[0]} to \${b.check_out.toISOString().split('T')[0]}\`,
          amount: parseInt(b.total_price)
        })),
        food: await Promise.all(guestOrders.map(async o => {
          const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [o.id]);
          return {
            description: itemsRes.rows.map(i => \`\${i.name} x\${i.quantity}\`).join(', '),
            amount: parseInt(o.total_price)
          };
        })),
        parking: guestParking.map(s => ({
          description: \`Parking Slot #\${s.slot_number}\`,
          amount: 15
        }))
      },
      subtotals: { rooms: roomCharges, food: foodCharges, parking: parkingCharges },
      grandTotal
    };

    res.json({ receipt });
  } catch (error) {
    res.status(500).json({ error: 'Database error generating receipt.' });
  }
};

module.exports = { getDashboard, getReceipts, generateReceipt };
