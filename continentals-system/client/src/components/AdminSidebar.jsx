import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BedDouble, Car, UtensilsCrossed, 
  DollarSign, Receipt, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/rooms', icon: BedDouble, label: 'Rooms' },
  { to: '/admin/parking', icon: Car, label: 'Parking' },
  { to: '/admin/dining', icon: UtensilsCrossed, label: 'Dining' },
  { to: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
  { to: '/admin/receipts', icon: Receipt, label: 'Receipts' },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] w-10 h-10 bg-continental-primary text-white rounded-lg flex items-center justify-center shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar fixed md:sticky top-0 left-0 z-50 flex flex-col ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open !left-0' : ''}`}>
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold">Continentals</span>
              <span className="badge bg-continental-accent/20 text-continental-accent-light text-[10px]">Admin</span>
            </motion.div>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false); }}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
