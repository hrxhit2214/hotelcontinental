import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Search, Printer, Download, X, BedDouble, UtensilsCrossed, Car, DollarSign } from 'lucide-react';
import { api } from '../../utils/api';

export default function Receipts() {
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [revenueByType, setRevenueByType] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [guestIdInput, setGuestIdInput] = useState('2');

  useEffect(() => { loadReceipts(); }, [filterType, search]);

  const loadReceipts = async () => {
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (search) params.search = search;
      const data = await api.getReceipts(params);
      setTransactions(data.transactions);
      setTotalRevenue(data.totalRevenue);
      setRevenueByType(data.revenueByType);
    } catch (err) { console.error(err); }
  };

  const handleGenerateReceipt = async () => {
    try {
      const data = await api.generateReceipt(parseInt(guestIdInput));
      setReceipt(data.receipt);
    } catch (err) { console.error(err); }
  };

  const typeIcons = { room: BedDouble, food: UtensilsCrossed, parking: Car };
  const typeColors = { room: 'text-blue-600 bg-blue-500/10', food: 'text-green-600 bg-green-500/10', parking: 'text-orange-600 bg-orange-500/10' };

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Financial Ledger & Receipts</h1>
        <p className="text-continental-text-light text-sm">View transactions, generate receipts, and analyze revenue.</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-continental-border p-5">
          <DollarSign size={18} className="text-purple-600 mb-2" />
          <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-continental-text-light">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-continental-border p-5">
          <BedDouble size={18} className="text-blue-600 mb-2" />
          <p className="text-2xl font-bold">₹{(revenueByType.rooms || 0).toLocaleString()}</p>
          <p className="text-xs text-continental-text-light">Room Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-continental-border p-5">
          <UtensilsCrossed size={18} className="text-green-600 mb-2" />
          <p className="text-2xl font-bold">₹{(revenueByType.food || 0).toLocaleString()}</p>
          <p className="text-xs text-continental-text-light">Food Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-continental-border p-5">
          <Car size={18} className="text-orange-600 mb-2" />
          <p className="text-2xl font-bold">₹{(revenueByType.parking || 0).toLocaleString()}</p>
          <p className="text-xs text-continental-text-light">Parking Revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-continental-text-light" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="input-field pl-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'rooms', 'food', 'parking'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterType === type ? 'bg-continental-accent text-white' : 'bg-white border border-continental-border text-continental-text-light'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-continental-border overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-continental-border bg-continental-border-light/50">
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Guest</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-continental-text-light uppercase px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => {
                const Icon = typeIcons[t.type] || Receipt;
                const colorClass = typeColors[t.type] || 'text-gray-600 bg-gray-100';
                return (
                  <tr key={t.id} className="border-b border-continental-border last:border-0 hover:bg-continental-border-light/30">
                    <td className="px-5 py-3 text-xs font-mono">{t.id}</td>
                    <td className="px-5 py-3">
                      <div className={`w-7 h-7 rounded-lg ${colorClass} flex items-center justify-center`}>
                        <Icon size={14} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium">{t.guestName}</td>
                    <td className="px-5 py-3 text-xs text-continental-text-light max-w-xs truncate">{t.description}</td>
                    <td className="px-5 py-3 font-semibold text-sm">₹{t.amount}</td>
                    <td className="px-5 py-3">
                      <span className={`badge text-[10px] ${t.status === 'confirmed' || t.status === 'delivered' || t.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-continental-text-light">{new Date(t.date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Generator */}
      <div className="bg-white rounded-xl border border-continental-border p-6">
        <h3 className="font-serif text-lg font-bold mb-4">Generate Consolidated Receipt</h3>
        <div className="flex gap-3 items-end mb-6">
          <div className="flex-1">
            <label className="text-xs font-semibold text-continental-text-light mb-1 block">Guest ID</label>
            <input type="number" value={guestIdInput} onChange={e => setGuestIdInput(e.target.value)} className="input-field text-sm" placeholder="e.g., 2" />
          </div>
          <button onClick={handleGenerateReceipt} className="btn-primary">
            <Receipt size={14} /> Generate
          </button>
        </div>

        {receipt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-continental-border rounded-xl p-6 bg-continental-border-light/30"
            id="receipt-print"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold">Continentals</h2>
                <p className="text-xs text-continental-text-light">Consolidated Guest Receipt</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-continental-text-light">{receipt.receiptId}</p>
                <p className="text-xs text-continental-text-light">{new Date(receipt.generatedAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-medium">{receipt.guest.name}</p>
              <p className="text-xs text-continental-text-light">{receipt.guest.email}</p>
            </div>

            {/* Room Charges */}
            {receipt.lineItems.rooms.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase text-continental-text-light mb-2 flex items-center gap-2">
                  <BedDouble size={14} /> Room Charges
                </h4>
                {receipt.lineItems.rooms.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-continental-border/50 last:border-0">
                    <span className="text-continental-text-light">{item.description}</span>
                    <span className="font-medium">₹{item.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Food Charges */}
            {receipt.lineItems.food.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase text-continental-text-light mb-2 flex items-center gap-2">
                  <UtensilsCrossed size={14} /> Dining Charges
                </h4>
                {receipt.lineItems.food.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-continental-border/50 last:border-0">
                    <span className="text-continental-text-light">{item.description}</span>
                    <span className="font-medium">₹{item.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Parking Charges */}
            {receipt.lineItems.parking.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase text-continental-text-light mb-2 flex items-center gap-2">
                  <Car size={14} /> Parking Charges
                </h4>
                {receipt.lineItems.parking.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-continental-border/50 last:border-0">
                    <span className="text-continental-text-light">{item.description}</span>
                    <span className="font-medium">₹{item.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="border-t-2 border-continental-primary pt-3 mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-continental-text-light">Rooms</span>
                <span>₹{receipt.subtotals.rooms}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-continental-text-light">Dining</span>
                <span>₹{receipt.subtotals.food}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-continental-text-light">Parking</span>
                <span>₹{receipt.subtotals.parking}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-continental-border pt-2">
                <span>Grand Total</span>
                <span className="text-continental-accent">₹{receipt.grandTotal}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 no-print">
              <button onClick={() => window.print()} className="btn-secondary text-xs">
                <Printer size={14} /> Print
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
