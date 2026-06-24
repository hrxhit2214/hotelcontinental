import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingBag, X, Check, UtensilsCrossed, Trash2 } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

export default function Dining() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items: cartItems, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [roomNumber, setRoomNumber] = useState('');
  const [tableId, setTableId] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadMenu();
  }, [activeCategory]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await api.getMenu(activeCategory !== 'all' ? activeCategory : undefined);
      setMenuItems(data.menuItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = activeSubcategory === 'all'
    ? menuItems
    : menuItems.filter(i => i.subcategory === activeSubcategory);

  const subcategories = ['all', ...new Set(menuItems.map(i => i.subcategory))];

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dining');
      return;
    }
    if (!roomNumber && !tableId) {
      setToast({ type: 'error', message: 'Please enter a room number or table ID.' });
      return;
    }
    try {
      setOrdering(true);
      const items = cartItems.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }));
      const result = await api.placeOrder({ items, roomNumber, tableId });
      setToast({ type: 'success', message: result.message });
      clearCart();
      setIsOpen(false);
      setRoomNumber('');
      setTableId('');
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setOrdering(false);
    }
  };

  const getCartQty = (menuItemId) => {
    const item = cartItems.find(i => i.menuItemId === menuItemId);
    return item?.quantity || 0;
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <p className="text-continental-accent text-sm font-semibold uppercase tracking-widest mb-2">Dining</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Food & Beverage</h1>
          <p className="text-continental-text-light max-w-2xl">
            Explore our curated dining experiences. From à la carte masterpieces to lavish buffet spreads.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'dine-in', label: 'Dine-In (A La Carte)' },
            { value: 'buffet', label: 'Buffet Packages' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setActiveCategory(tab.value); setActiveSubcategory('all'); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === tab.value
                  ? 'bg-continental-accent text-white'
                  : 'bg-white text-continental-text-light border border-continental-border hover:border-continental-accent'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Cart Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="ml-auto btn-primary relative"
          >
            <ShoppingBag size={16} />
            Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </motion.div>

        {/* Subcategory filters */}
        {subcategories.length > 2 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubcategory(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeSubcategory === sub
                    ? 'bg-continental-primary text-white'
                    : 'bg-continental-border-light text-continental-text-light hover:bg-continental-border'
                }`}
              >
                {sub === 'all' ? 'All' : sub}
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, i) => {
            const qty = getCartQty(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="card group h-full flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    <div className="absolute top-3 left-3">
                      <span className={`badge text-[10px] ${item.category === 'buffet' ? 'badge-warning' : 'badge-info'}`}>
                        {item.subcategory}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-serif text-base font-bold mb-1">{item.name}</h3>
                    <p className="text-continental-text-light text-xs mb-3 flex-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-continental-primary">₹{item.price}</span>
                      {qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, qty - 1)} className="w-7 h-7 rounded-full bg-continental-border-light flex items-center justify-center hover:bg-continental-border transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{qty}</span>
                          <button onClick={() => addItem(item)} className="w-7 h-7 rounded-full bg-continental-accent text-white flex items-center justify-center hover:bg-continental-accent-light transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addItem(item)} className="btn-primary text-xs py-1.5 px-3">
                          <Plus size={12} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-5 border-b border-continental-border">
                <div>
                  <h3 className="font-serif text-lg font-bold">Your Order</h3>
                  <p className="text-xs text-continental-text-light">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-continental-border-light flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <UtensilsCrossed size={40} className="text-continental-border mx-auto mb-3" />
                    <p className="text-continental-text-light text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.menuItemId} className="flex gap-3 items-center">
                      <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-continental-accent text-sm font-medium">₹{item.price * item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-6 h-6 rounded-full bg-continental-border-light flex items-center justify-center text-xs">
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-6 h-6 rounded-full bg-continental-accent text-white flex items-center justify-center text-xs">
                          <Plus size={10} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.menuItemId)} className="text-continental-text-light hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="p-5 border-t border-continental-border space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-continental-text-light mb-1 block">Room Number</label>
                      <input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} placeholder="e.g., 201" className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-continental-text-light mb-1 block">Table ID</label>
                      <input value={tableId} onChange={e => setTableId(e.target.value)} placeholder="e.g., T-05" className="input-field text-sm" />
                    </div>
                  </div>

                  <div className="bg-continental-border-light rounded-lg p-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total</span>
                      <span className="text-continental-accent text-lg">₹{totalPrice}</span>
                    </div>
                  </div>

                  <button onClick={handlePlaceOrder} disabled={ordering} className="btn-primary w-full justify-center py-3">
                    {ordering ? 'Placing Order...' : isAuthenticated ? 'Place Order' : 'Sign In to Order'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
