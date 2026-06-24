const pool = require('../config/database');

const getPricing = async (req, res) => {
  try {
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked
      FROM rooms
    `);
    const totalRooms = parseInt(statsRes.rows[0].total) || 0;
    const bookedRooms = parseInt(statsRes.rows[0].booked) || 0;
    const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

    const configRes = await pool.query('SELECT * FROM pricing_config LIMIT 1');
    const config = configRes.rows[0] || { enabled: true, thresholds: [] };
    const thresholds = typeof config.thresholds === 'string' ? JSON.parse(config.thresholds) : config.thresholds;

    let activeMultiplier = 1;
    if (config.enabled && thresholds && Array.isArray(thresholds)) {
      for (const threshold of thresholds) {
        if (occupancyRate >= threshold.occupancy) {
          activeMultiplier = threshold.multiplier;
          break;
        }
      }
    }

    const overridesRes = await pool.query('SELECT * FROM pricing_overrides');
    const overrides = {};
    overridesRes.rows.forEach(r => overrides[r.room_type] = r.price);

    const roomTypes = ['suite', 'king', 'sea-facing', 'family'];
    const pricesByType = {};

    for (const type of roomTypes) {
      const typeRes = await pool.query(
        `SELECT COUNT(*) as count, SUM(base_price) as total_base, SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked
         FROM rooms WHERE type = $1`, [type]
      );
      const stats = typeRes.rows[0];
      const count = parseInt(stats.count) || 0;
      const totalBase = parseInt(stats.total_base) || 0;
      
      const avgBase = count > 0 ? Math.round(totalBase / count) : 0;
      const override = overrides[type];

      pricesByType[type] = {
        basePrice: avgBase,
        currentPrice: override || Math.round(avgBase * activeMultiplier),
        hasOverride: !!override,
        overridePrice: override || null,
        roomCount: count,
        bookedCount: parseInt(stats.booked) || 0
      };
    }

    res.json({
      config: { enabled: config.enabled, thresholds },
      occupancyRate,
      activeMultiplier,
      pricesByType,
      overrides
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching pricing.' });
  }
};

const setOverride = async (req, res) => {
  const { roomType, price } = req.body;

  if (!roomType || !price) {
    return res.status(400).json({ error: 'Room type and price are required.' });
  }

  try {
    await pool.query(
      `INSERT INTO pricing_overrides (room_type, price) VALUES ($1, $2)
       ON CONFLICT (room_type) DO UPDATE SET price = EXCLUDED.price`,
      [roomType, parseInt(price)]
    );

    const overridesRes = await pool.query('SELECT * FROM pricing_overrides');
    const overrides = {};
    overridesRes.rows.forEach(r => overrides[r.room_type] = r.price);

    res.json({
      message: `Price override set for ${roomType}: $${price}/night`,
      overrides
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error setting override.' });
  }
};

const removeOverride = async (req, res) => {
  const { roomType } = req.params;

  try {
    await pool.query('DELETE FROM pricing_overrides WHERE room_type = $1', [roomType]);

    const overridesRes = await pool.query('SELECT * FROM pricing_overrides');
    const overrides = {};
    overridesRes.rows.forEach(r => overrides[r.room_type] = r.price);

    res.json({
      message: `Price override removed for ${roomType}`,
      overrides
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error removing override.' });
  }
};

const updateConfig = async (req, res) => {
  const { thresholds, enabled } = req.body;

  try {
    let updateQuery = 'UPDATE pricing_config SET ';
    const params = [];
    const sets = [];

    if (thresholds) {
      params.push(JSON.stringify(thresholds));
      sets.push(`thresholds = $${params.length}`);
    }

    if (typeof enabled === 'boolean') {
      params.push(enabled);
      sets.push(`enabled = $${params.length}`);
    }

    if (sets.length === 0) return res.status(400).json({ error: 'No configuration to update.' });

    updateQuery += sets.join(', ') + ' RETURNING *';
    const result = await pool.query(updateQuery);
    
    const config = result.rows[0];
    config.thresholds = typeof config.thresholds === 'string' ? JSON.parse(config.thresholds) : config.thresholds;

    res.json({ config, message: 'Pricing configuration updated.' });
  } catch (error) {
    res.status(500).json({ error: 'Database error updating config.' });
  }
};

module.exports = { getPricing, setOverride, removeOverride, updateConfig };
