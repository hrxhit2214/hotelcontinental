import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Car, X, Check, Unlock, Lock, Plus, Search, Edit, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function ParkingMgmt() {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({});
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Allocation modal state
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [allocating, setAllocating] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [editPlate, setEditPlate] = useState('');

  useEffect(() => { loadSlots(); }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadSlots = async () => {
    try {
      const data = await api.getParkingSlots();
      setSlots(data.slots);
      setStats(data.stats);
    } catch (err) { console.error(err); }
  };

  const handleAllocate = async () => {
    if (!selectedSlot) return;
    try {
      setAllocating(true);
      const result = await api.reserveSlot(selectedSlot.id, vehiclePlate);
      setToast({ type: 'success', message: result.message });
      setShowAllocateModal(false);
      setSelectedSlot(null);
      setVehiclePlate('');
      loadSlots();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setAllocating(false);
    }
  };

  const handleRelease = async (slotId) => {
    try {
      const result = await api.releaseSlot(slotId);
      setToast({ type: 'success', message: result.message });
      loadSlots();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'available') {
      setSelectedSlot(slot);
      setVehiclePlate('');
      setShowAllocateModal(true);
    } else {
      setEditSlot(slot);
      setEditPlate(slot.vehiclePlate || '');
      setShowEditModal(true);
    }
  };

  const occupied = slots.filter(s => s.status === 'occupied');
  const filteredOccupied = occupied.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.slotNumber.includes(q) || (s.vehiclePlate && s.vehiclePlate.toLowerCase().includes(q));
  });

  const filteredSlots = filter === 'all'
    ? slots
    : filter === 'available'
      ? slots.filter(s => s.status === 'available')
      : slots.filter(s => s.status === 'occupied');

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        {/* Header */}
        <motion.div variants={fadeUp} className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Parking Management</h1>
            <p className="text-continental-text-light text-sm">Monitor, allocate, and manage parking stall assignments in real-time.</p>
          </div>
          <button
            onClick={() => { setSelectedSlot(null); setVehiclePlate(''); setShowAllocateModal(true); }}
            className="btn-primary text-sm"
          >
            <Plus size={16} /> Allocate Slot
          </button>
        </motion.div>

        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {toast.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
            <button onClick={() => setToast(null)} className="ml-auto hover:opacity-70"><X size={14} /></button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Total Stalls', value: stats.total, color: 'text-continental-primary', bg: 'bg-slate-50', border: 'border-slate-200' },
            { label: 'Available', value: stats.available, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'Occupied', value: stats.occupied, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
            { label: 'Occupancy Rate', value: `${stats.occupancyRate || 0}%`, color: 'text-continental-accent', bg: 'bg-blue-50', border: 'border-blue-200' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} rounded-xl border ${stat.border} p-5 text-center`}>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-continental-text-light mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Live Parking Map */}
        <motion.div variants={fadeUp} className="bg-white rounded-xl border border-continental-border p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Live Parking Map</h3>
              <p className="text-xs text-continental-text-light mt-1">Click any slot to allocate or manage it</p>
            </div>
            <div className="flex items-center gap-6 text-xs text-continental-text-light">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300" />
                Available
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300" />
                Occupied
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-5">
            {['all', 'available', 'occupied'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? 'bg-continental-accent text-white'
                    : 'bg-continental-border-light text-continental-text-light hover:bg-continental-border'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-10 gap-2 max-w-3xl">
            {filteredSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => handleSlotClick(slot)}
                className={`parking-slot text-[9px] font-bold ${slot.status} hover:shadow-md`}
                title={`Slot #${slot.slotNumber} — ${slot.status}${slot.vehiclePlate ? ` (${slot.vehiclePlate})` : ''}`}
              >
                {slot.status === 'occupied' ? <Car size={12} /> : slot.slotNumber}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Occupied Slots Table */}
        <motion.div variants={fadeUp} className="bg-white rounded-xl border border-continental-border overflow-hidden">
          <div className="px-6 py-5 border-b border-continental-border flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Occupied Stalls</h3>
              <p className="text-xs text-continental-text-light mt-1">{occupied.length} of {stats.total} stalls currently assigned</p>
            </div>
            <div className="relative w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-continental-text-light" />
              <input
                type="text"
                placeholder="Search by slot or plate..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-xs rounded-lg"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-continental-border bg-continental-border-light/50">
                  <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-6 py-3">Slot</th>
                  <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-6 py-3">Vehicle Plate</th>
                  <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-6 py-3">Reserved At</th>
                  <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-6 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOccupied.map(slot => {
                  const duration = slot.reservedAt
                    ? Math.round((Date.now() - new Date(slot.reservedAt).getTime()) / 3600000)
                    : 0;
                  return (
                    <tr key={slot.id} className="border-b border-continental-border last:border-0 hover:bg-continental-border-light/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                            <Car size={16} className="text-red-500" />
                          </div>
                          <span className="font-bold text-sm">#{slot.slotNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono bg-continental-border-light px-2 py-1 rounded">
                          {slot.vehiclePlate || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-continental-text-light">
                        {slot.reservedAt ? new Date(slot.reservedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-xs text-continental-text-light">
                        {duration > 0 ? `${duration}h` : '< 1h'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSlotClick(slot)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleRelease(slot.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="Release Slot"
                          >
                            <Unlock size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOccupied.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-continental-text-light">
                      <Car size={36} className="mx-auto mb-3 text-continental-border" />
                      <p className="text-sm font-medium">No occupied stalls found</p>
                      <p className="text-xs mt-1">All parking stalls are currently available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* ====== ALLOCATE MODAL ====== */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAllocateModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-continental-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Allocate Parking Slot</h3>
                  <p className="text-xs text-continental-text-light mt-1">Assign a vehicle to a parking stall</p>
                </div>
                <button onClick={() => setShowAllocateModal(false)} className="w-8 h-8 rounded-full hover:bg-continental-border-light flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Slot Selection */}
              <div>
                <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-2 block">
                  Parking Slot
                </label>
                {selectedSlot ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Car size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Slot #{selectedSlot.slotNumber}</p>
                        <p className="text-xs text-green-600">Available</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedSlot(null)} className="text-continental-text-light hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-continental-text-light mb-3">Select an available slot:</p>
                    <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-1">
                      {slots.filter(s => s.status === 'available').map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className="parking-slot available text-[8px]"
                        >
                          {slot.slotNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Plate */}
              <div>
                <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-2 block">
                  Vehicle Plate Number
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="e.g., KA-01-AB-1234"
                  className="input-field text-sm rounded-xl"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAllocateModal(false)} className="btn-secondary flex-1 justify-center text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleAllocate}
                  disabled={!selectedSlot || allocating}
                  className="btn-primary flex-1 justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {allocating ? 'Allocating...' : <>
                    <Lock size={14} /> Allocate Slot
                  </>}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ====== EDIT/VIEW MODAL ====== */}
      {showEditModal && editSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-continental-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Slot #{editSlot.slotNumber}</h3>
                <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full hover:bg-continental-border-light flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <Car size={22} className="text-red-500" />
                </div>
                <div>
                  <p className="font-bold">Currently Occupied</p>
                  <p className="text-xs text-continental-text-light">
                    Plate: <span className="font-mono font-medium">{editSlot.vehiclePlate || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-continental-text-light">
                    Since: {editSlot.reservedAt ? new Date(editSlot.reservedAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { handleRelease(editSlot.id); setShowEditModal(false); }}
                className="btn-primary w-full justify-center bg-red-500 hover:bg-red-600 text-sm py-3"
              >
                <Unlock size={16} /> Release This Slot
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
