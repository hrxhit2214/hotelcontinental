import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, X, Check, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../../utils/api';

const typeLabels = { suite: 'Suite', king: 'King Size', 'sea-facing': 'Sea Facing', family: 'Family Suite' };

export default function Pricing() {
  const [pricing, setPricing] = useState(null);
  const [overrideType, setOverrideType] = useState('suite');
  const [overridePrice, setOverridePrice] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { loadPricing(); }, []);

  const loadPricing = async () => {
    try {
      const data = await api.getPricing();
      setPricing(data);
    } catch (err) { console.error(err); }
  };

  const handleSetOverride = async () => {
    if (!overridePrice) return;
    try {
      await api.setPriceOverride(overrideType, parseInt(overridePrice));
      setToast({ type: 'success', message: `Price override set for ${typeLabels[overrideType]}: ₹${overridePrice}/night` });
      setOverridePrice('');
      loadPricing();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  const handleRemoveOverride = async (roomType) => {
    try {
      await api.removePriceOverride(roomType);
      setToast({ type: 'success', message: `Override removed for ${typeLabels[roomType]}` });
      loadPricing();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  };

  if (!pricing) return <div className="p-8 text-center text-continental-text-light">Loading pricing data...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Dynamic Pricing Controls</h1>
        <p className="text-continental-text-light text-sm">Manage automated pricing algorithms and manual overrides.</p>
      </div>

      {toast && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Algorithm Status */}
      <div className="bg-white rounded-xl border border-continental-border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold">Pricing Algorithm</h3>
          <span className={`badge ${pricing.config.enabled ? 'badge-success' : 'badge-danger'}`}>
            {pricing.config.enabled ? 'Active' : 'Disabled'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-continental-border-light/50">
            <p className="text-xs text-continental-text-light mb-1">Current Occupancy</p>
            <p className="text-2xl font-bold">{pricing.occupancyRate}%</p>
          </div>
          <div className="p-4 rounded-lg bg-continental-border-light/50">
            <p className="text-xs text-continental-text-light mb-1">Active Multiplier</p>
            <p className="text-2xl font-bold">{pricing.activeMultiplier}x</p>
          </div>
          <div className="p-4 rounded-lg bg-continental-border-light/50">
            <p className="text-xs text-continental-text-light mb-1">Status</p>
            <p className="text-2xl font-bold text-continental-accent">
              {pricing.occupancyRate >= 90 ? 'Peak' : pricing.occupancyRate >= 70 ? 'High' : 'Normal'}
            </p>
          </div>
        </div>

        {/* Threshold Rules */}
        <h4 className="text-sm font-semibold mb-3">Pricing Rules</h4>
        <div className="space-y-2">
          {pricing.config.thresholds.map((t, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
              pricing.occupancyRate >= t.occupancy ? 'border-continental-accent bg-continental-accent/5' : 'border-continental-border'
            }`}>
              <TrendingUp size={16} className={pricing.occupancyRate >= t.occupancy ? 'text-continental-accent' : 'text-continental-text-light'} />
              <span className="text-sm">
                When occupancy ≥ <strong>{t.occupancy}%</strong>, prices multiply by <strong>{t.multiplier}x</strong>
              </span>
              {pricing.occupancyRate >= t.occupancy && <span className="badge badge-info text-[9px] ml-auto">Active</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Current Prices by Type */}
      <div className="bg-white rounded-xl border border-continental-border p-6 mb-6">
        <h3 className="font-serif text-lg font-bold mb-4">Current Prices by Room Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(pricing.pricesByType).map(([type, data]) => (
            <div key={type} className={`p-4 rounded-lg border ${data.hasOverride ? 'border-orange-300 bg-orange-50/50' : 'border-continental-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{typeLabels[type]}</h4>
                {data.hasOverride && (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-warning text-[9px]">Override</span>
                    <button onClick={() => handleRemoveOverride(type)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">₹{data.currentPrice}</span>
                <span className="text-xs text-continental-text-light mb-1">/night</span>
                {data.basePrice !== data.currentPrice && !data.hasOverride && (
                  <span className="text-xs text-continental-text-light line-through mb-1">₹{data.basePrice}</span>
                )}
              </div>
              <p className="text-[10px] text-continental-text-light mt-1">
                {data.bookedCount} of {data.roomCount} rooms booked
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Override Form */}
      <div className="bg-white rounded-xl border border-continental-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-orange-500" />
          <h3 className="font-serif text-lg font-bold">Set Manual Override</h3>
        </div>
        <p className="text-xs text-continental-text-light mb-4">
          Manual overrides take absolute priority over the automated pricing algorithm.
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs font-semibold text-continental-text-light mb-1 block">Room Type</label>
            <select value={overrideType} onChange={e => setOverrideType(e.target.value)} className="input-field text-sm">
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-continental-text-light mb-1 block">Override Price (₹/night)</label>
            <input type="number" value={overridePrice} onChange={e => setOverridePrice(e.target.value)} placeholder="e.g., 350" className="input-field text-sm" />
          </div>
          <button onClick={handleSetOverride} className="btn-primary">
            <DollarSign size={14} /> Set Override
          </button>
        </div>
      </div>
    </div>
  );
}
