const bcrypt = require('bcryptjs');

// ============ USERS ============
const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@continentals.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'John Guest',
    email: 'john@example.com',
    password: bcrypt.hashSync('guest123', 10),
    role: 'guest',
    createdAt: new Date().toISOString()
  }
];

// ============ ROOMS ============
const rooms = [
  // Suites
  { id: 1, number: '101', type: 'suite', name: 'Presidential Suite', basePrice: 450, currentPrice: 450, floor: 1, capacity: 4, amenities: ['King Bed', 'Lounge Area', 'Mini Bar', 'Ocean View', 'Jacuzzi', 'Butler Service'], sqft: 1200, status: 'available', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' },
  { id: 2, number: '102', type: 'suite', name: 'Royal Suite', basePrice: 420, currentPrice: 420, floor: 1, capacity: 4, amenities: ['King Bed', 'Living Room', 'Mini Bar', 'City View', 'Spa Bath'], sqft: 1100, status: 'available', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' },
  { id: 3, number: '201', type: 'suite', name: 'Grand Suite', basePrice: 400, currentPrice: 400, floor: 2, capacity: 3, amenities: ['King Bed', 'Sitting Area', 'Mini Bar', 'Garden View'], sqft: 1000, status: 'booked', bookedBy: 2, checkIn: '2026-06-19', checkOut: '2026-06-22' },
  { id: 4, number: '202', type: 'suite', name: 'Luxury Suite', basePrice: 380, currentPrice: 380, floor: 2, capacity: 3, amenities: ['King Bed', 'Lounge', 'Mini Bar', 'Pool View'], sqft: 950, status: 'available', image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800' },
  { id: 5, number: '301', type: 'suite', name: 'Penthouse Suite', basePrice: 550, currentPrice: 550, floor: 3, capacity: 6, amenities: ['King Bed', 'Panoramic View', 'Private Terrace', 'Full Kitchen', 'Jacuzzi'], sqft: 1500, status: 'available', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800' },

  // King Size Bed
  { id: 6, number: '103', type: 'king', name: 'Deluxe King', basePrice: 220, currentPrice: 220, floor: 1, capacity: 2, amenities: ['King Bed', 'Work Desk', 'Mini Fridge', 'City View'], sqft: 450, status: 'available', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' },
  { id: 7, number: '104', type: 'king', name: 'Premium King', basePrice: 240, currentPrice: 240, floor: 1, capacity: 2, amenities: ['King Bed', 'Sitting Area', 'Mini Bar', 'Garden View'], sqft: 500, status: 'booked', bookedBy: 2, checkIn: '2026-06-18', checkOut: '2026-06-21' },
  { id: 8, number: '203', type: 'king', name: 'Superior King', basePrice: 200, currentPrice: 200, floor: 2, capacity: 2, amenities: ['King Bed', 'Work Desk', 'Mini Fridge'], sqft: 400, status: 'available', image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800' },
  { id: 9, number: '204', type: 'king', name: 'Classic King', basePrice: 190, currentPrice: 190, floor: 2, capacity: 2, amenities: ['King Bed', 'Work Desk', 'Coffee Maker'], sqft: 380, status: 'available', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800' },
  { id: 10, number: '302', type: 'king', name: 'Executive King', basePrice: 260, currentPrice: 260, floor: 3, capacity: 2, amenities: ['King Bed', 'Work Station', 'Mini Bar', 'Panoramic View'], sqft: 520, status: 'available', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800' },

  // Sea Facing
  { id: 11, number: '105', type: 'sea-facing', name: 'Ocean Breeze', basePrice: 320, currentPrice: 320, floor: 1, capacity: 2, amenities: ['Queen Bed', 'Balcony', 'Ocean View', 'Mini Bar'], sqft: 480, status: 'available', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800' },
  { id: 12, number: '205', type: 'sea-facing', name: 'Sunset View', basePrice: 340, currentPrice: 340, floor: 2, capacity: 2, amenities: ['King Bed', 'Private Balcony', 'Panoramic Sea View', 'Lounge Chair'], sqft: 520, status: 'booked', bookedBy: 2, checkIn: '2026-06-20', checkOut: '2026-06-23' },
  { id: 13, number: '303', type: 'sea-facing', name: 'Horizon Suite', basePrice: 380, currentPrice: 380, floor: 3, capacity: 3, amenities: ['King Bed', 'Wrap-around Balcony', '180° Ocean View', 'Mini Bar', 'Telescope'], sqft: 600, status: 'available', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800' },
  { id: 14, number: '304', type: 'sea-facing', name: 'Coral Room', basePrice: 300, currentPrice: 300, floor: 3, capacity: 2, amenities: ['Queen Bed', 'Balcony', 'Sea View', 'Coffee Station'], sqft: 440, status: 'available', image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800' },
  { id: 15, number: '106', type: 'sea-facing', name: 'Tidal Room', basePrice: 310, currentPrice: 310, floor: 1, capacity: 2, amenities: ['King Bed', 'Terrace', 'Direct Beach Access', 'Outdoor Shower'], sqft: 500, status: 'available', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800' },

  // 2-Room Family Suite
  { id: 16, number: '107', type: 'family', name: 'Family Haven', basePrice: 350, currentPrice: 350, floor: 1, capacity: 6, amenities: ['King Bed + Twin Beds', 'Connecting Rooms', 'Play Area', 'Kitchenette', 'Game Console'], sqft: 900, status: 'available', image: 'https://images.unsplash.com/photo-1598928506311-c55ez637a26c?w=800' },
  { id: 17, number: '206', type: 'family', name: 'Family Grand', basePrice: 380, currentPrice: 380, floor: 2, capacity: 6, amenities: ['King Bed + Bunk Beds', 'Connecting Rooms', 'Kids Corner', 'Full Kitchen', 'Balcony'], sqft: 1000, status: 'available', image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800' },
  { id: 18, number: '305', type: 'family', name: 'Family Deluxe', basePrice: 400, currentPrice: 400, floor: 3, capacity: 5, amenities: ['King Bed + Sofa Bed', 'Connecting Rooms', 'Living Area', 'Kitchenette', 'Garden View'], sqft: 950, status: 'booked', bookedBy: 2, checkIn: '2026-06-19', checkOut: '2026-06-25' },
  { id: 19, number: '306', type: 'family', name: 'Family Premium', basePrice: 420, currentPrice: 420, floor: 3, capacity: 6, amenities: ['King Bed + Twin Beds', 'Connecting Rooms', 'Play Room', 'Full Kitchen', 'Pool View'], sqft: 1050, status: 'available', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
  { id: 20, number: '108', type: 'family', name: 'Family Comfort', basePrice: 330, currentPrice: 330, floor: 1, capacity: 5, amenities: ['Queen Bed + Twin Beds', 'Connecting Rooms', 'Sitting Area', 'Mini Fridge'], sqft: 850, status: 'available', image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800' }
];

// ============ PARKING ============
const parkingSlots = [];
for (let i = 1; i <= 100; i++) {
  const isOccupied = [3, 7, 12, 15, 22, 28, 34, 41, 45, 53, 58, 67, 72, 78, 85, 91, 96].includes(i);
  parkingSlots.push({
    id: i,
    slotNumber: String(i).padStart(3, '0'),
    status: isOccupied ? 'occupied' : 'available',
    reservedBy: isOccupied ? 2 : null,
    vehiclePlate: isOccupied ? `KA-${String(i).padStart(2, '0')}-AB-${1000 + i}` : null,
    reservedAt: isOccupied ? new Date().toISOString() : null
  });
}

// ============ DINING MENU ============
const menuItems = [
  // Dine-In (A La Carte)
  { id: 1, name: 'Truffle Risotto', category: 'dine-in', subcategory: 'Mains', description: 'Creamy arborio rice with black truffle shavings and aged parmesan', price: 38, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400', available: true },
  { id: 2, name: 'Grilled Salmon', category: 'dine-in', subcategory: 'Mains', description: 'Atlantic salmon with lemon butter sauce, asparagus and herb rice', price: 42, image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', available: true },
  { id: 3, name: 'Wagyu Steak', category: 'dine-in', subcategory: 'Mains', description: 'Premium A5 wagyu with roasted vegetables and red wine jus', price: 85, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', available: true },
  { id: 4, name: 'Caesar Salad', category: 'dine-in', subcategory: 'Starters', description: 'Romaine lettuce, croutons, parmesan with house-made dressing', price: 18, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', available: true },
  { id: 5, name: 'Lobster Bisque', category: 'dine-in', subcategory: 'Starters', description: 'Rich creamy lobster soup with cognac and fresh herbs', price: 24, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', available: true },
  { id: 6, name: 'Chocolate Fondant', category: 'dine-in', subcategory: 'Desserts', description: 'Warm molten chocolate cake with vanilla ice cream', price: 16, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', available: true },
  { id: 7, name: 'Crème Brûlée', category: 'dine-in', subcategory: 'Desserts', description: 'Classic French custard with caramelized sugar crust', price: 14, image: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?w=400', available: true },
  { id: 8, name: 'Margherita Pizza', category: 'dine-in', subcategory: 'Mains', description: 'Wood-fired pizza with fresh mozzarella, basil, and San Marzano tomatoes', price: 22, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', available: true },
  { id: 9, name: 'Prawn Cocktail', category: 'dine-in', subcategory: 'Starters', description: 'Jumbo prawns with Marie Rose sauce on a bed of crisp lettuce', price: 20, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', available: true },
  { id: 10, name: 'Tiramisu', category: 'dine-in', subcategory: 'Desserts', description: 'Espresso-soaked ladyfingers layered with mascarpone cream', price: 15, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', available: true },

  // Buffet Packages
  { id: 11, name: 'Continental Breakfast', category: 'buffet', subcategory: 'Breakfast', description: 'Full spread: pastries, eggs, bacon, fruits, cereals, juices, and coffee', price: 35, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400', available: true },
  { id: 12, name: 'Lunch Buffet', category: 'buffet', subcategory: 'Lunch', description: 'International cuisine: 15+ dishes, salad bar, carving station, desserts', price: 45, image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400', available: true },
  { id: 13, name: 'Dinner Gala', category: 'buffet', subcategory: 'Dinner', description: 'Premium 7-course experience: seafood, grills, pasta, sushi, and artisan desserts', price: 65, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', available: true },
  { id: 14, name: 'Sunday Brunch', category: 'buffet', subcategory: 'Brunch', description: 'Chef\'s special: eggs benedict, waffles, mimosas, live cooking stations', price: 55, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', available: true },
  { id: 15, name: 'Afternoon Tea', category: 'buffet', subcategory: 'Tea', description: 'English-style: finger sandwiches, scones, pastries, and premium teas', price: 30, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', available: true },
  { id: 16, name: 'Kids Buffet', category: 'buffet', subcategory: 'Kids', description: 'Child-friendly favorites: nuggets, fries, pasta, ice cream sundae bar', price: 20, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', available: true }
];

// ============ BOOKINGS ============
const bookings = [
  { id: 1, userId: 2, roomId: 3, roomNumber: '201', roomType: 'suite', checkIn: '2026-06-19', checkOut: '2026-06-22', guests: 2, totalPrice: 1200, status: 'confirmed', createdAt: '2026-06-15T10:30:00Z' },
  { id: 2, userId: 2, roomId: 7, roomNumber: '104', roomType: 'king', checkIn: '2026-06-18', checkOut: '2026-06-21', guests: 2, totalPrice: 720, status: 'confirmed', createdAt: '2026-06-14T14:20:00Z' },
  { id: 3, userId: 2, roomId: 12, roomNumber: '205', roomType: 'sea-facing', checkIn: '2026-06-20', checkOut: '2026-06-23', guests: 2, totalPrice: 1020, status: 'confirmed', createdAt: '2026-06-16T09:15:00Z' },
  { id: 4, userId: 2, roomId: 18, roomNumber: '305', roomType: 'family', checkIn: '2026-06-19', checkOut: '2026-06-25', guests: 4, totalPrice: 2400, status: 'confirmed', createdAt: '2026-06-13T16:45:00Z' }
];

// ============ FOOD ORDERS ============
const foodOrders = [
  { id: 1, userId: 2, items: [{ menuItemId: 3, name: 'Wagyu Steak', quantity: 1, price: 85 }, { menuItemId: 5, name: 'Lobster Bisque', quantity: 1, price: 24 }], roomNumber: '201', totalPrice: 109, status: 'delivered', createdAt: '2026-06-19T12:30:00Z' },
  { id: 2, userId: 2, items: [{ menuItemId: 11, name: 'Continental Breakfast', quantity: 2, price: 35 }], roomNumber: '104', totalPrice: 70, status: 'preparing', createdAt: '2026-06-19T07:00:00Z' }
];

// ============ PRICING OVERRIDES ============
const pricingOverrides = {};

// ============ DYNAMIC PRICING CONFIG ============
const pricingConfig = {
  thresholds: [
    { occupancy: 90, multiplier: 1.5 },
    { occupancy: 70, multiplier: 1.25 }
  ],
  enabled: true
};

module.exports = {
  users,
  rooms,
  parkingSlots,
  menuItems,
  bookings,
  foodOrders,
  pricingOverrides,
  pricingConfig
};
