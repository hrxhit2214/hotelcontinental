import { useState, useEffect } from 'react';
import { UtensilsCrossed, Check, X } from 'lucide-react';
import { api } from '../../utils/api';

export default function DiningMgmt() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data.orders);
    } catch (err) { console.error(err); }
  };

  const statusColors = { preparing: 'badge-warning', ready: 'badge-info', delivered: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Dining Orders</h1>
        <p className="text-continental-text-light text-sm">View and manage all food & beverage orders.</p>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2"><X size={14} /></button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-continental-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-continental-border bg-continental-border-light/50">
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Order ID</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Items</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Room/Table</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-continental-border last:border-0 hover:bg-continental-border-light/30">
                  <td className="px-5 py-3 font-semibold text-sm">#{order.id}</td>
                  <td className="px-5 py-3 text-sm max-w-xs truncate">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                  <td className="px-5 py-3 text-sm">{order.roomNumber ? `Room ${order.roomNumber}` : `Table ${order.tableId}`}</td>
                  <td className="px-5 py-3 font-semibold text-sm">₹{order.totalPrice}</td>
                  <td className="px-5 py-3"><span className={`badge text-[10px] ${statusColors[order.status] || 'badge-info'}`}>{order.status}</span></td>
                  <td className="px-5 py-3 text-xs text-continental-text-light">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="6" className="text-center py-12 text-continental-text-light">
                  <UtensilsCrossed size={32} className="mx-auto mb-2 text-continental-border" />
                  <p>No orders yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
