const data = require('../data/seed');

const getDashboard = (req, res) => {
  const totalRooms = data.rooms.length;
  const bookedRooms = data.rooms.filter(r => r.status === 'booked').length;
  const occupancyRate = Math.round((bookedRooms / totalRooms) * 100);

  const totalParkingSlots = data.parkingSlots.length;
  const occupiedSlots = data.parkingSlots.filter(s => s.status === 'occupied').length;

  const totalRoomRevenue = data.bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalFoodRevenue = data.foodOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalRevenue = totalRoomRevenue + totalFoodRevenue;

  const todayBookings = data.bookings.filter(b => b.checkIn === new Date().toISOString().split('T')[0]).length;

  res.json({
    rooms: { total: totalRooms, booked: bookedRooms, available: totalRooms - bookedRooms, occupancyRate },
    parking: { total: totalParkingSlots, occupied: occupiedSlots, available: totalParkingSlots - occupiedSlots },
    revenue: { total: totalRevenue, rooms: totalRoomRevenue, food: totalFoodRevenue },
    bookings: { total: data.bookings.length, todayCheckIns: todayBookings },
    recentBookings: data.bookings.slice(-5).reverse(),
    recentOrders: data.foodOrders.slice(-5).reverse()
  });
};

const getReceipts = (req, res) => {
  const { type, search, dateFrom, dateTo } = req.query;

  let transactions = [];

  // Room bookings
  if (!type || type === 'all' || type === 'rooms') {
    data.bookings.forEach(b => {
      const user = data.users.find(u => u.id === b.userId);
      transactions.push({
        id: `ROOM-${b.id}`,
        type: 'room',
        guestName: user?.name || 'Unknown',
        description: `Room ${b.roomNumber} (${b.roomType}) — ${b.checkIn} to ${b.checkOut}`,
        amount: b.totalPrice,
        status: b.status,
        date: b.createdAt
      });
    });
  }

  // Food orders
  if (!type || type === 'all' || type === 'food') {
    data.foodOrders.forEach(o => {
      const user = data.users.find(u => u.id === o.userId);
      transactions.push({
        id: `FOOD-${o.id}`,
        type: 'food',
        guestName: user?.name || 'Unknown',
        description: `${o.items.map(i => i.name).join(', ')} — Room ${o.roomNumber || 'N/A'}`,
        amount: o.totalPrice,
        status: o.status,
        date: o.createdAt
      });
    });
  }

  // Parking
  if (!type || type === 'all' || type === 'parking') {
    data.parkingSlots.filter(s => s.status === 'occupied').forEach(s => {
      const user = data.users.find(u => u.id === s.reservedBy);
      transactions.push({
        id: `PARK-${s.id}`,
        type: 'parking',
        guestName: user?.name || 'Unknown',
        description: `Slot #${s.slotNumber} — ${s.vehiclePlate || 'No plate'}`,
        amount: 15,
        status: 'active',
        date: s.reservedAt
      });
    });
  }

  // Apply search filter
  if (search) {
    const q = search.toLowerCase();
    transactions = transactions.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.guestName.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  }

  // Sort by date (most recent first)
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Revenue summary
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const revenueByType = {
    rooms: transactions.filter(t => t.type === 'room').reduce((sum, t) => sum + t.amount, 0),
    food: transactions.filter(t => t.type === 'food').reduce((sum, t) => sum + t.amount, 0),
    parking: transactions.filter(t => t.type === 'parking').reduce((sum, t) => sum + t.amount, 0)
  };

  res.json({ transactions, totalRevenue, revenueByType });
};

const generateReceipt = (req, res) => {
  const { guestId } = req.body;

  const user = data.users.find(u => u.id === parseInt(guestId));
  if (!user) return res.status(404).json({ error: 'Guest not found.' });

  const guestBookings = data.bookings.filter(b => b.userId === user.id);
  const guestOrders = data.foodOrders.filter(o => o.userId === user.id);
  const guestParking = data.parkingSlots.filter(s => s.reservedBy === user.id);

  const roomCharges = guestBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const foodCharges = guestOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const parkingCharges = guestParking.length * 15;
  const grandTotal = roomCharges + foodCharges + parkingCharges;

  const receipt = {
    receiptId: `RCP-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    guest: { name: user.name, email: user.email },
    lineItems: {
      rooms: guestBookings.map(b => ({
        description: `Room ${b.roomNumber} (${b.roomType}) — ${b.checkIn} to ${b.checkOut}`,
        amount: b.totalPrice
      })),
      food: guestOrders.map(o => ({
        description: o.items.map(i => `${i.name} x${i.quantity}`).join(', '),
        amount: o.totalPrice
      })),
      parking: guestParking.map(s => ({
        description: `Parking Slot #${s.slotNumber}`,
        amount: 15
      }))
    },
    subtotals: { rooms: roomCharges, food: foodCharges, parking: parkingCharges },
    grandTotal
  };

  res.json({ receipt });
};

module.exports = { getDashboard, getReceipts, generateReceipt };
