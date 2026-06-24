import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Edit, Check, X } from 'lucide-react';
import { api } from '../../utils/api';

const typeLabels = { suite: 'Suite', king: 'King Size', 'sea-facing': 'Sea Facing', family: 'Family Suite' };

export default function RoomMgmt() {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => { loadRooms(); }, []);

  const loadRooms = async () => {
    try {
      const data = await api.getRooms();
      setRooms(data.rooms);
      setStats(data.stats);
    } catch (err) { console.error(err); }
  };

  const handleSaveStatus = async (roomId) => {
    try {
      await api.updateRoomStatus(roomId, editStatus);
      setEditingId(null);
      setToast({ type: 'success', message: 'Room status updated!' });
      loadRooms();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const filtered = filter === 'all' ? rooms : rooms.filter(r => r.status === filter);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Room Management</h1>
        <p className="text-continental-text-light text-sm">Manage room inventory and booking statuses.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, onClick: () => setFilter('all') },
          { label: 'Available', value: stats.available, onClick: () => setFilter('available') },
          { label: 'Booked', value: stats.booked, onClick: () => setFilter('booked') },
          { label: 'Occupancy', value: `${stats.occupancyRate}%` },
        ].map((s, i) => (
          <button key={i} onClick={s.onClick} className="bg-white rounded-xl border border-continental-border p-4 text-left hover:border-continental-accent transition-colors">
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs text-continental-text-light">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Room Table */}
      <div className="bg-white rounded-xl border border-continental-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-continental-border bg-continental-border-light/50">
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-5 py-3">Room</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-5 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-5 py-3">Capacity</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-5 py-3">Dates</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => (
                <tr key={room.id} className="border-b border-continental-border last:border-0 hover:bg-continental-border-light/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={room.image || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{room.name}</p>
                        <p className="text-xs text-continental-text-light">#{room.number} · Floor {room.floor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="badge badge-info text-[10px]">{typeLabels[room.type]}</span></td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-sm">₹{room.currentPrice}</p>
                    {room.basePrice !== room.currentPrice && <p className="text-[10px] text-continental-text-light line-through">₹{room.basePrice}</p>}
                  </td>
                  <td className="px-5 py-3 text-sm">{room.capacity} guests</td>
                  <td className="px-5 py-3">
                    {editingId === room.id ? (
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input-field text-xs py-1 px-2">
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="housekeeping">Housekeeping</option>
                      </select>
                    ) : (
                      <span className={`badge text-[10px] ${
                        room.status === 'available' ? 'badge-success' : room.status === 'booked' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {room.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-continental-text-light">
                    {room.checkIn && <span>{room.checkIn} → {room.checkOut}</span>}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === room.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleSaveStatus(room.id)} className="w-7 h-7 rounded bg-green-500/10 text-green-600 flex items-center justify-center hover:bg-green-500/20">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="w-7 h-7 rounded bg-red-500/10 text-red-600 flex items-center justify-center hover:bg-red-500/20">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(room.id); setEditStatus(room.status); }} className="w-7 h-7 rounded bg-continental-border-light flex items-center justify-center hover:bg-continental-border">
                        <Edit size={14} className="text-continental-text-light" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
