const pool = require('../config/database');

const getSlots = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM parking_slots ORDER BY id');
    const slots = result.rows;
    
    const total = slots.length;
    const occupied = slots.filter(s => s.status === 'occupied').length;
    const available = total - occupied;

    res.json({
      slots,
      stats: {
        total,
        available,
        occupied,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching parking slots.' });
  }
};

const reserveSlot = async (req, res) => {
  const { slotId, vehiclePlate } = req.body;
  const userId = req.user.id;

  try {
    const slotRes = await pool.query('SELECT * FROM parking_slots WHERE id = $1', [slotId]);
    if (slotRes.rows.length === 0) return res.status(404).json({ error: 'Parking slot not found.' });
    
    const slot = slotRes.rows[0];
    if (slot.status === 'occupied') return res.status(400).json({ error: 'Slot is already occupied.' });

    const updateRes = await pool.query(
      `UPDATE parking_slots 
       SET status = 'occupied', reserved_by = $1, vehicle_plate = $2, reserved_at = CURRENT_TIMESTAMP
       WHERE id = $3 RETURNING *`,
      [userId, vehiclePlate || null, slotId]
    );

    const updatedSlot = updateRes.rows[0];
    res.json({ slot: updatedSlot, message: `Slot #${updatedSlot.slot_number} reserved successfully!` });
  } catch (error) {
    res.status(500).json({ error: 'Database error reserving slot.' });
  }
};

const releaseSlot = async (req, res) => {
  try {
    const slotRes = await pool.query('SELECT * FROM parking_slots WHERE id = $1', [req.params.id]);
    if (slotRes.rows.length === 0) return res.status(404).json({ error: 'Parking slot not found.' });

    const updateRes = await pool.query(
      `UPDATE parking_slots 
       SET status = 'available', reserved_by = NULL, vehicle_plate = NULL, reserved_at = NULL
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    const updatedSlot = updateRes.rows[0];
    res.json({ slot: updatedSlot, message: `Slot #${updatedSlot.slot_number} released successfully!` });
  } catch (error) {
    res.status(500).json({ error: 'Database error releasing slot.' });
  }
};

module.exports = { getSlots, reserveSlot, releaseSlot };
