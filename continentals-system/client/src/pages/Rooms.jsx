import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, CalendarDays, Users, BedDouble, X, Check, Wifi, Coffee, Bath, Mountain, Star } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const typeLabels = { suite: 'Suite', king: 'King Size', 'sea-facing': 'Sea Facing', family: 'Family Suite' };

export default function Rooms() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(searchParams.get('type') || 'all');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [booking, setBooking] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRooms();
  }, [activeType]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeType !== 'all') params.type = activeType;
      if (guests) params.guests = guests;
      const data = await api.getRooms(params);
      setRooms(data.rooms);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/rooms');
      return;
    }
    if (!checkIn || !checkOut) {
      setToast({ type: 'error', message: 'Please select check-in and check-out dates.' });
      return;
    }
    try {
      setBooking(true);
      const result = await api.bookRoom({ roomId: selectedRoom.id, checkIn, checkOut, guests: parseInt(guests) || 1 });
      setToast({ type: 'success', message: result.message });
      setSelectedRoom(null);
      loadRooms();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setBooking(false);
    }
  };

  const nights = checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)) : 0;

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-16">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <p className="text-continental-accent text-sm font-semibold uppercase tracking-widest mb-2">Rooms & Suites</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Find Your Perfect Room</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-continental-text-light">
            <span>{stats.total} rooms total</span>
            <span>·</span>
            <span className="text-continental-success font-medium">{stats.available} available</span>
            <span>·</span>
            <span>{stats.occupancyRate}% occupancy</span>
            {stats.occupancyRate >= 70 && (
              <span className="badge badge-warning text-[10px]">
                Dynamic pricing active ({stats.occupancyRate >= 90 ? '1.5x' : '1.25x'})
              </span>
            )}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-xl border border-continental-border p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-1.5 block">Room Type</label>
              <select value={activeType} onChange={e => setActiveType(e.target.value)} className="input-field text-sm">
                <option value="all">All Types</option>
                <option value="suite">Suites</option>
                <option value="king">King Size</option>
                <option value="sea-facing">Sea Facing</option>
                <option value="family">Family Suite</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-1.5 block">Check In</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-1.5 block">Check Out</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="input-field text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-1.5 block">Guests</label>
              <select value={guests} onChange={e => setGuests(e.target.value)} className="input-field text-sm">
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={loadRooms} className="btn-primary w-full justify-center">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
        </motion.div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card group h-full flex flex-col">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="badge badge-info text-[10px]">{typeLabels[room.type]}</span>
                    <span className={`badge text-[10px] ${room.status === 'available' ? 'badge-success' : 'badge-danger'}`}>
                      {room.status}
                    </span>
                  </div>
                  {room.basePrice !== room.currentPrice && (
                    <div className="absolute top-3 right-3">
                      <span className="badge badge-warning text-[10px]">Dynamic Price</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <div className="text-white text-xs space-y-1">
                      <p className="font-semibold">{room.sqft} sq ft · Floor {room.floor}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {room.amenities?.slice(0, 4).map((a, j) => (
                          <span key={j} className="bg-white/20 rounded px-2 py-0.5 text-[10px]">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif text-lg font-bold mb-1">{room.name}</h3>
                  <p className="text-continental-text-light text-xs mb-1">Room {room.number} · Up to {room.capacity} guests</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.amenities?.slice(0, 3).map((a, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-continental-border-light text-continental-text-light">{a}</span>
                    ))}
                    {room.amenities?.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-continental-border-light text-continental-text-light">+{room.amenities.length - 3} more</span>
                    )}
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      {room.basePrice !== room.currentPrice && (
                        <span className="text-xs text-continental-text-light line-through mr-2">₹{room.basePrice}</span>
                      )}
                      <span className="text-2xl font-bold text-continental-primary">₹{room.currentPrice}</span>
                      <span className="text-continental-text-light text-xs"> /night</span>
                    </div>
                    <button
                      onClick={() => room.status === 'available' && setSelectedRoom(room)}
                      disabled={room.status !== 'available'}
                      className={`btn-primary text-xs py-2 px-4 ${room.status !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {room.status === 'available' ? 'Book Now' : 'Booked'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {rooms.length === 0 && !loading && (
          <div className="text-center py-20">
            <BedDouble size={48} className="text-continental-border mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold mb-2">No rooms found</h3>
            <p className="text-continental-text-light text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRoom(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="relative aspect-[16/9]">
                <img src={selectedRoom.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'} alt={selectedRoom.name} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedRoom(null)} className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl font-bold mb-1">{selectedRoom.name}</h3>
                <p className="text-continental-text-light text-sm mb-4">Room {selectedRoom.number} · {typeLabels[selectedRoom.type]} · Up to {selectedRoom.capacity} guests</p>
                
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedRoom.amenities?.map((a, j) => (
                    <span key={j} className="text-[10px] px-2 py-1 rounded-full bg-continental-border-light text-continental-text-light">{a}</span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-continental-text-light mb-1 block">Check In</label>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-continental-text-light mb-1 block">Check Out</label>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="input-field text-sm" />
                  </div>
                </div>

                {nights > 0 && (
                  <div className="bg-continental-border-light rounded-lg p-4 mb-5">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-continental-text-light">₹{selectedRoom.currentPrice} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span className="font-semibold">₹{selectedRoom.currentPrice * nights}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-continental-border pt-2 mt-2">
                      <span>Total</span>
                      <span className="text-continental-accent text-lg">₹{selectedRoom.currentPrice * nights}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="btn-primary w-full justify-center py-3"
                >
                  {booking ? 'Booking...' : isAuthenticated ? 'Confirm Booking' : 'Sign In to Book'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
