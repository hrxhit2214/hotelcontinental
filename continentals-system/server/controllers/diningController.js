const pool = require('../config/database');

const getMenu = async (req, res) => {
  const { category } = req.query;

  try {
    let query = 'SELECT * FROM menu_items WHERE available = true';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $1`;
    }

    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    res.json({ menuItems: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching menu.' });
  }
};

const placeOrder = async (req, res) => {
  const { items, roomNumber, tableId } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  if (!roomNumber && !tableId) {
    return res.status(400).json({ error: 'Order must be bound to a room number or table ID.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menuRes = await client.query('SELECT * FROM menu_items WHERE id = $1', [item.menuItemId]);
      if (menuRes.rows.length === 0) throw new Error(`Menu item ${item.menuItemId} not found.`);
      
      const menuItem = menuRes.rows[0];
      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;

      orderItemsData.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price,
        subtotal: itemTotal
      });
    }

    const orderRes = await client.query(
      `INSERT INTO food_orders (user_id, room_number, table_id, total_price, status) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, roomNumber || null, tableId || null, totalPrice, 'preparing']
    );

    const order = orderRes.rows[0];
    order.items = [];

    for (const item of orderItemsData) {
      const itemRes = await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, name, quantity, price, subtotal) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [order.id, item.menuItemId, item.name, item.quantity, item.price, item.subtotal]
      );
      order.items.push(itemRes.rows[0]);
    }

    await client.query('COMMIT');
    res.status(201).json({ order, message: 'Order placed successfully!' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message || 'Database error during order placement.' });
  } finally {
    client.release();
  }
};

const getOrders = async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  try {
    let query = 'SELECT * FROM food_orders';
    const params = [];

    if (!isAdmin) {
      params.push(userId);
      query += ' WHERE user_id = $1';
    }

    query += ' ORDER BY created_at DESC';

    const ordersRes = await pool.query(query, params);
    const orders = ordersRes.rows;

    // Fetch items for each order
    for (const order of orders) {
      const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsRes.rows;
    }

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching orders.' });
  }
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    const orderRes = await pool.query('SELECT * FROM food_orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) return res.status(404).json({ error: 'Order not found.' });

    const updateRes = await pool.query(
      'UPDATE food_orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    res.json({ order: updateRes.rows[0], message: 'Order status updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Database error updating order status.' });
  }
};

module.exports = { getMenu, placeOrder, getOrders, updateOrderStatus };
