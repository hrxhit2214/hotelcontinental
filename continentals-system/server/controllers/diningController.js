const data = require('../data/seed');

let nextOrderId = data.foodOrders.length + 1;

const getMenu = (req, res) => {
  const { category } = req.query;
  let items = data.menuItems.filter(i => i.available);

  if (category && category !== 'all') {
    items = items.filter(i => i.category === category);
  }

  res.json({ menuItems: items });
};

const placeOrder = (req, res) => {
  const { items, roomNumber, tableId } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  if (!roomNumber && !tableId) {
    return res.status(400).json({ error: 'Order must be bound to a room number or table ID.' });
  }

  let totalPrice = 0;
  const orderItems = items.map(item => {
    const menuItem = data.menuItems.find(m => m.id === item.menuItemId);
    if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found.`);
    const itemTotal = menuItem.price * item.quantity;
    totalPrice += itemTotal;
    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: item.quantity,
      price: menuItem.price,
      subtotal: itemTotal
    };
  });

  const order = {
    id: nextOrderId++,
    userId,
    items: orderItems,
    roomNumber: roomNumber || null,
    tableId: tableId || null,
    totalPrice,
    status: 'preparing',
    createdAt: new Date().toISOString()
  };

  data.foodOrders.push(order);

  res.status(201).json({ order, message: 'Order placed successfully!' });
};

const getOrders = (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const orders = isAdmin
    ? data.foodOrders
    : data.foodOrders.filter(o => o.userId === userId);

  res.json({ orders });
};

const updateOrderStatus = (req, res) => {
  const { status } = req.body;
  const order = data.foodOrders.find(o => o.id === parseInt(req.params.id));
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  order.status = status;
  res.json({ order, message: 'Order status updated.' });
};

module.exports = { getMenu, placeOrder, getOrders, updateOrderStatus };
