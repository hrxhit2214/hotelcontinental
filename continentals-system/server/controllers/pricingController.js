const data = require('../data/seed');

const getPricing = (req, res) => {
  const totalRooms = data.rooms.length;
  const bookedRooms = data.rooms.filter(r => r.status === 'booked').length;
  const occupancyRate = Math.round((bookedRooms / totalRooms) * 100);

  let activeMultiplier = 1;
  for (const threshold of data.pricingConfig.thresholds) {
    if (occupancyRate >= threshold.occupancy) {
      activeMultiplier = threshold.multiplier;
      break;
    }
  }

  // Get current prices by room type
  const roomTypes = ['suite', 'king', 'sea-facing', 'family'];
  const pricesByType = {};
  
  roomTypes.forEach(type => {
    const roomsOfType = data.rooms.filter(r => r.type === type);
    const avgBase = Math.round(roomsOfType.reduce((sum, r) => sum + r.basePrice, 0) / roomsOfType.length);
    const override = data.pricingOverrides[type];
    
    pricesByType[type] = {
      basePrice: avgBase,
      currentPrice: override || Math.round(avgBase * activeMultiplier),
      hasOverride: !!override,
      overridePrice: override || null,
      roomCount: roomsOfType.length,
      bookedCount: roomsOfType.filter(r => r.status === 'booked').length
    };
  });

  res.json({
    config: data.pricingConfig,
    occupancyRate,
    activeMultiplier,
    pricesByType,
    overrides: data.pricingOverrides
  });
};

const setOverride = (req, res) => {
  const { roomType, price } = req.body;

  if (!roomType || !price) {
    return res.status(400).json({ error: 'Room type and price are required.' });
  }

  data.pricingOverrides[roomType] = parseInt(price);

  res.json({
    message: `Price override set for ${roomType}: $${price}/night`,
    overrides: data.pricingOverrides
  });
};

const removeOverride = (req, res) => {
  const { roomType } = req.params;
  delete data.pricingOverrides[roomType];

  res.json({
    message: `Price override removed for ${roomType}`,
    overrides: data.pricingOverrides
  });
};

const updateConfig = (req, res) => {
  const { thresholds, enabled } = req.body;

  if (thresholds) data.pricingConfig.thresholds = thresholds;
  if (typeof enabled === 'boolean') data.pricingConfig.enabled = enabled;

  res.json({ config: data.pricingConfig, message: 'Pricing configuration updated.' });
};

module.exports = { getPricing, setOverride, removeOverride, updateConfig };
