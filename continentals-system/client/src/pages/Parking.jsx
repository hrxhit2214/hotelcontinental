import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, X, Check, Info } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function Parking() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [reserving, setReserving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadSlots();
    const interval = setInterval(loadSlots, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const loadSlots = async () => {
    try {
      const data = await api.getParkingSlots();
      setSlots(data.slots);
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReserve = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/parking');
      return;
    }
    try {
      setReserving(true);
      const result = await api.reserveSlot(selectedSlot.id, vehiclePlate);
      setToast({ type: 'success', message: result.message });
      setSelectedSlot(null);
      setVehiclePlate('');
      loadSlots();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setReserving(false);
    }
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <p className="text-continental-accent text-sm font-semibold uppercase tracking-widest mb-2">Parking</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Live Parking Map</h1>
          <p className="text-continental-text-light max-w-2xl">
            View real-time parking availability and reserve your preferred spot instantly. The map updates every 10 seconds.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-continental-border p-4 text-center">
            <p className="text-2xl font-bold text-continental-primary">{stats.total}</p>
            <p className="text-xs text-continental-text-light">Total Stalls</p>
          </div>
          <div className="bg-white rounded-xl border border-continental-border p-4 text-center">
            <p className="text-2xl font-bold text-continental-success">{stats.available}</p>
            <p className="text-xs text-continental-text-light">Available</p>
          </div>
          <div className="bg-white rounded-xl border border-continental-border p-4 text-center">
            <p className="text-2xl font-bold text-continental-danger">{stats.occupied}</p>
            <p className="text-xs text-continental-text-light">Occupied</p>
          </div>
          <div className="bg-white rounded-xl border border-continental-border p-4 text-center">
            <p className="text-2xl font-bold text-continental-primary">{stats.occupancyRate}%</p>
            <p className="text-xs text-continental-text-light">Occupancy Rate</p>
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-green-100 border-2 border-green-200" />
            <span className="text-xs text-continental-text-light font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-100 border-2 border-red-200" />
            <span className="text-xs text-continental-text-light font-medium">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <Info size={14} className="text-continental-text-light" />
            <span className="text-xs text-continental-text-light">Click an available slot to reserve</span>
          </div>
        </motion.div>

        {/* Parking Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="bg-white rounded-2xl border border-continental-border p-6"
        >
          <div className="grid grid-cols-10 gap-2 max-w-3xl mx-auto">
            {slots.map(slot => (
              <motion.button
                key={slot.id}
                whileHover={slot.status === 'available' ? { scale: 1.1 } : {}}
                whileTap={slot.status === 'available' ? { scale: 0.95 } : {}}
                onClick={() => slot.status === 'available' && setSelectedSlot(slot)}
                className={`parking-slot ${slot.status}`}
                title={`Slot #${slot.slotNumber} - ${slot.status}${slot.vehiclePlate ? ` (${slot.vehiclePlate})` : ''}`}
              >
                {slot.status === 'occupied' ? (
                  <Car size={14} />
                ) : (
                  <span className="text-[10px]">{slot.slotNumber}</span>
                )}
              </motion.button>
            ))}
          </div>
          
          {/* Row labels */}
          <div className="flex justify-between mt-4 px-2">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className="text-[10px] text-continental-text-light font-medium w-full text-center">
                {String(i + 1).padStart(2, '0')}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reserve Modal */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSlot(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-continental-success/10 flex items-center justify-center mx-auto mb-4">
                  <Car size={28} className="text-continental-success" />
                </div>
                <h3 className="font-serif text-xl font-bold">Reserve Parking Slot</h3>
                <p className="text-continental-text-light text-sm mt-1">Slot #{selectedSlot.slotNumber}</p>
              </div>

              <div className="mb-5">
                <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-1.5 block">Vehicle Plate (Optional)</label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value)}
                  placeholder="e.g., KA-01-AB-1234"
                  className="input-field text-sm"
                />
              </div>

              <div className="bg-continental-border-light rounded-lg p-4 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-continental-text-light">Parking Fee</span>
                  <span className="font-semibold">$15/day</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedSlot(null)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={handleReserve} disabled={reserving} className="btn-primary flex-1 justify-center">
                  {reserving ? 'Reserving...' : 'Reserve'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
