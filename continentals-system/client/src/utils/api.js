const API_BASE = 'https://hotel-backend-uuwd.onrender.com/api';

const getToken = () => localStorage.getItem('continental_token');

const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  getProfile: () => apiRequest('/auth/profile'),

  // Rooms
  getRooms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/rooms${query ? `?${query}` : ''}`);
  },
  getRoomById: (id) => apiRequest(`/rooms/${id}`),
  bookRoom: (data) => apiRequest('/rooms/book', { method: 'POST', body: JSON.stringify(data) }),
  updateRoomStatus: (id, status) => apiRequest(`/rooms/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Parking
  getParkingSlots: () => apiRequest('/parking'),
  reserveSlot: (slotId, vehiclePlate) => apiRequest('/parking/reserve', { method: 'POST', body: JSON.stringify({ slotId, vehiclePlate }) }),
  releaseSlot: (id) => apiRequest(`/parking/${id}/release`, { method: 'PUT' }),

  // Dining
  getMenu: (category) => apiRequest(`/dining/menu${category ? `?category=${category}` : ''}`),
  placeOrder: (data) => apiRequest('/dining/order', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => apiRequest('/dining/orders'),

  // Pricing
  getPricing: () => apiRequest('/pricing'),
  setPriceOverride: (roomType, price) => apiRequest('/pricing/override', { method: 'POST', body: JSON.stringify({ roomType, price }) }),
  removePriceOverride: (roomType) => apiRequest(`/pricing/override/${roomType}`, { method: 'DELETE' }),

  // Admin
  getDashboard: () => apiRequest('/admin/dashboard'),
  getReceipts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/receipts${query ? `?${query}` : ''}`);
  },
  generateReceipt: (guestId) => apiRequest('/admin/receipts/generate', { method: 'POST', body: JSON.stringify({ guestId }) }),
};

export default api;
