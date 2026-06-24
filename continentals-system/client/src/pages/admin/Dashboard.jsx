import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, Car, DollarSign, TrendingUp, Users, UtensilsCrossed, Calendar } from 'lucide-react';
import { api } from '../../utils/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-pulse text-continental-text-light">Loading dashboard...</div></div>;
  }

  if (!data) return null;

  const metricCards = [
    { icon: BedDouble, label: 'Room Occupancy', value: `${data.rooms.occupancyRate}%`, sub: `${data.rooms.booked} of ${data.rooms.total} booked`, color: 'bg-blue-500/10 text-blue-600' },
    { icon: Car, label: 'Parking Usage', value: `${data.parking.occupied}`, sub: `${data.parking.available} stalls free`, color: 'bg-green-500/10 text-green-600' },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${data.revenue.total.toLocaleString()}`, sub: 'Rooms + Dining + Parking', color: 'bg-purple-500/10 text-purple-600' },
    { icon: Calendar, label: "Today's Check-ins", value: `${data.bookings.todayCheckIns}`, sub: `${data.bookings.total} total bookings`, color: 'bg-orange-500/10 text-orange-600' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <h1 className="text-3xl font-serif font-bold mb-1">Dashboard</h1>
          <p className="text-continental-text-light text-sm">Overview of hotel operations and performance.</p>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {metricCards.map((card, i) => (
            <motion.div key={i} variants={fadeUp}>
              <div className="bg-white rounded-xl border border-continental-border p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                    <card.icon size={20} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-continental-primary mb-0.5">{card.value}</p>
                <p className="text-xs text-continental-text-light">{card.label}</p>
                <p className="text-[10px] text-continental-text-light mt-1">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue Breakdown */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {[
            { label: 'Room Revenue', value: data.revenue.rooms, icon: BedDouble, color: 'text-blue-600' },
            { label: 'Food Revenue', value: data.revenue.food, icon: UtensilsCrossed, color: 'text-green-600' },
            { label: 'Occupancy Rate', value: `${data.rooms.occupancyRate}%`, icon: TrendingUp, color: 'text-purple-600', isPercent: true },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-continental-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <item.icon size={18} className={item.color} />
                <span className="text-sm text-continental-text-light">{item.label}</span>
              </div>
              <p className="text-3xl font-bold text-continental-primary">
                {item.isPercent ? item.value : `₹${item.value.toLocaleString()}`}
              </p>
              {!item.isPercent && (
                <div className="mt-3 h-2 bg-continental-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-continental-accent rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (item.value / data.revenue.total) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Recent Bookings */}
          <motion.div variants={fadeUp}>
            <div className="bg-white rounded-xl border border-continental-border p-5">
              <h3 className="font-serif text-lg font-bold mb-4">Recent Bookings</h3>
              <div className="space-y-3">
                {data.recentBookings.map(booking => (
                  <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-continental-border-light/50">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <BedDouble size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">Room {booking.roomNumber} ({booking.roomType})</p>
                      <p className="text-xs text-continental-text-light">{booking.checkIn} → {booking.checkOut}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{booking.totalPrice}</p>
                      <span className="badge badge-success text-[9px]">{booking.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div variants={fadeUp}>
            <div className="bg-white rounded-xl border border-continental-border p-5">
              <h3 className="font-serif text-lg font-bold mb-4">Recent Food Orders</h3>
              <div className="space-y-3">
                {data.recentOrders.map(order => (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-continental-border-light/50">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <UtensilsCrossed size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{order.items.map(i => i.name).join(', ')}</p>
                      <p className="text-xs text-continental-text-light">Room {order.roomNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">₹{order.totalPrice}</p>
                      <span className={`badge text-[9px] ${order.status === 'delivered' ? 'badge-success' : 'badge-warning'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
