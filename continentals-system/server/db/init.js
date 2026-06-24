const pool = require('../config/database');
const data = require('../data/seed');

const initDB = async () => {
  const client = await pool.connect();

  try {
    console.log('Starting database initialization...');
    await client.query('BEGIN');

    // 1. Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'guest',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create Rooms Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id SERIAL PRIMARY KEY,
        number VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(100),
        name VARCHAR(255),
        base_price INT,
        current_price INT,
        floor INT,
        capacity INT,
        amenities JSONB,
        sqft INT,
        status VARCHAR(50) DEFAULT 'available',
        image VARCHAR(255),
        booked_by INT REFERENCES users(id) ON DELETE SET NULL,
        check_in DATE,
        check_out DATE
      )
    `);

    // 3. Create Parking Slots Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS parking_slots (
        id SERIAL PRIMARY KEY,
        slot_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        reserved_by INT REFERENCES users(id) ON DELETE SET NULL,
        vehicle_plate VARCHAR(100),
        reserved_at TIMESTAMP
      )
    `);

    // 4. Create Menu Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        subcategory VARCHAR(100),
        description TEXT,
        price INT,
        image VARCHAR(255),
        available BOOLEAN DEFAULT true
      )
    `);

    // 5. Create Bookings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        room_id INT REFERENCES rooms(id) ON DELETE CASCADE,
        room_number VARCHAR(50),
        room_type VARCHAR(100),
        room_name VARCHAR(255),
        check_in DATE,
        check_out DATE,
        guests INT,
        nights INT,
        price_per_night INT,
        total_price INT,
        status VARCHAR(50) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6. Create Food Orders Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS food_orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        room_number VARCHAR(50),
        table_id VARCHAR(50),
        total_price INT,
        status VARCHAR(50) DEFAULT 'preparing',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 7. Create Order Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES food_orders(id) ON DELETE CASCADE,
        menu_item_id INT REFERENCES menu_items(id) ON DELETE CASCADE,
        name VARCHAR(255),
        quantity INT,
        price INT,
        subtotal INT
      )
    `);

    // 8. Create Pricing Config & Overrides
    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing_config (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN DEFAULT true,
        thresholds JSONB
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing_overrides (
        id SERIAL PRIMARY KEY,
        room_type VARCHAR(100) UNIQUE,
        price INT
      )
    `);

    console.log('Tables created successfully.');

    // Function to check if a table is empty
    const isTableEmpty = async (tableName) => {
      const res = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
      return parseInt(res.rows[0].count) === 0;
    };

    // Insert Seed Data
    if (await isTableEmpty('users')) {
      for (const u of data.users) {
        await client.query(
          `INSERT INTO users (id, name, email, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [u.id, u.name, u.email, u.password, u.role, u.createdAt]
        );
      }
      await client.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
      console.log('Seeded users.');
    }

    if (await isTableEmpty('rooms')) {
      for (const r of data.rooms) {
        await client.query(
          `INSERT INTO rooms (id, number, type, name, base_price, current_price, floor, capacity, amenities, sqft, status, image, booked_by, check_in, check_out) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [r.id, r.number, r.type, r.name, r.basePrice, r.currentPrice, r.floor, r.capacity, JSON.stringify(r.amenities), r.sqft, r.status, r.image, r.bookedBy || null, r.checkIn || null, r.checkOut || null]
        );
      }
      await client.query("SELECT setval('rooms_id_seq', (SELECT MAX(id) FROM rooms))");
      console.log('Seeded rooms.');
    }

    if (await isTableEmpty('parking_slots')) {
      for (const s of data.parkingSlots) {
        await client.query(
          `INSERT INTO parking_slots (id, slot_number, status, reserved_by, vehicle_plate, reserved_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [s.id, s.slotNumber, s.status, s.reservedBy || null, s.vehiclePlate, s.reservedAt || null]
        );
      }
      await client.query("SELECT setval('parking_slots_id_seq', (SELECT MAX(id) FROM parking_slots))");
      console.log('Seeded parking slots.');
    }

    if (await isTableEmpty('menu_items')) {
      for (const m of data.menuItems) {
        await client.query(
          `INSERT INTO menu_items (id, name, category, subcategory, description, price, image, available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [m.id, m.name, m.category, m.subcategory, m.description, m.price, m.image, m.available]
        );
      }
      await client.query("SELECT setval('menu_items_id_seq', (SELECT MAX(id) FROM menu_items))");
      console.log('Seeded menu items.');
    }

    if (await isTableEmpty('bookings')) {
      for (const b of data.bookings) {
        await client.query(
          `INSERT INTO bookings (id, user_id, room_id, room_number, room_type, room_name, check_in, check_out, guests, nights, price_per_night, total_price, status, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [b.id, b.userId, b.roomId, b.roomNumber, b.roomType, b.roomName || null, b.checkIn, b.checkOut, b.guests || 1, b.nights || 1, b.pricePerNight || 0, b.totalPrice, b.status, b.createdAt]
        );
      }
      await client.query("SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings))");
      console.log('Seeded bookings.');
    }

    if (await isTableEmpty('food_orders')) {
      for (const o of data.foodOrders) {
        await client.query(
          `INSERT INTO food_orders (id, user_id, room_number, table_id, total_price, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [o.id, o.userId, o.roomNumber || null, o.tableId || null, o.totalPrice, o.status, o.createdAt]
        );

        // Seed order items
        if (o.items && o.items.length > 0) {
          for (const item of o.items) {
            await client.query(
              `INSERT INTO order_items (order_id, menu_item_id, name, quantity, price, subtotal) VALUES ($1, $2, $3, $4, $5, $6)`,
              [o.id, item.menuItemId, item.name, item.quantity, item.price, item.price * item.quantity]
            );
          }
        }
      }
      await client.query("SELECT setval('food_orders_id_seq', (SELECT MAX(id) FROM food_orders))");
      console.log('Seeded food orders.');
    }

    if (await isTableEmpty('pricing_config')) {
      await client.query(
        `INSERT INTO pricing_config (enabled, thresholds) VALUES ($1, $2)`,
        [data.pricingConfig.enabled, JSON.stringify(data.pricingConfig.thresholds)]
      );
      console.log('Seeded pricing config.');
    }

    if (await isTableEmpty('pricing_overrides')) {
      const keys = Object.keys(data.pricingOverrides || {});
      for (const key of keys) {
        await client.query(
          `INSERT INTO pricing_overrides (room_type, price) VALUES ($1, $2)`,
          [key, data.pricingOverrides[key]]
        );
      }
      console.log('Seeded pricing overrides.');
    }

    await client.query('COMMIT');
    console.log('Database initialization and seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
  } finally {
    client.release();
    pool.end();
  }
};

initDB();
