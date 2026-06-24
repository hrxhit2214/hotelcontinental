const data = require('../data/seed');

const getSlots = (req, res) => {
  const total = data.parkingSlots.length;
  const occupied = data.parkingSlots.filter(s => s.status === 'occupied').length;
  const available = total - occupied;

  res.json({
    slots: data.parkingSlots,
    stats: {
      total,
      available,
      occupied,
      occupancyRate: Math.round((occupied / total) * 100)
    }
  });
};

const reserveSlot = (req, res) => {
  const { slotId, vehiclePlate } = req.body;
  const userId = req.user.id;

  const slot = data.parkingSlots.find(s => s.id === parseInt(slotId));
  if (!slot) return res.status(404).json({ error: 'Parking slot not found.' });
  if (slot.status === 'occupied') return res.status(400).json({ error: 'Slot is already occupied.' });

  slot.status = 'occupied';
  slot.reservedBy = userId;
  slot.vehiclePlate = vehiclePlate || null;
  slot.reservedAt = new Date().toISOString();

  res.json({ slot, message: `Slot #${slot.slotNumber} reserved successfully!` });
};

const releaseSlot = (req, res) => {
  const slot = data.parkingSlots.find(s => s.id === parseInt(req.params.id));
  if (!slot) return res.status(404).json({ error: 'Parking slot not found.' });

  slot.status = 'available';
  slot.reservedBy = null;
  slot.vehiclePlate = null;
  slot.reservedAt = null;

  res.json({ slot, message: `Slot #${slot.slotNumber} released successfully!` });
};

module.exports = { getSlots, reserveSlot, releaseSlot };
