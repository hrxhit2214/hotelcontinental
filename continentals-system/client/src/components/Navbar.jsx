import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/parking', label: 'Parking' },
    { to: '/dining', label: 'Dining' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show guest navbar on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className={`glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="font-serif text-xl lg:text-2xl font-bold text-continental-primary tracking-tight">
              Continentals
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors duration-200 no-underline ${
                  location.pathname === link.to
                    ? 'text-continental-accent'
                    : 'text-continental-text-light hover:text-continental-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Link to="/admin/dashboard" className="btn-secondary text-xs py-2 px-3 no-underline">
                    <ShieldCheck size={14} /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm text-continental-text-light">
                  <User size={16} />
                  <span>{user.name}</span>
                </div>
                <button onClick={handleLogout} className="btn-secondary text-xs py-2 px-3">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-xs py-2 px-3 no-underline">
                  Sign In
                </Link>
                <Link to="/rooms" className="btn-primary text-xs py-2 px-3 no-underline">
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-continental-primary">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-continental-border"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2 text-sm font-medium no-underline ${
                    location.pathname === link.to ? 'text-continental-accent' : 'text-continental-text'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-continental-border flex gap-2">
                {isAuthenticated ? (
                  <button onClick={handleLogout} className="btn-secondary w-full justify-center text-xs">
                    <LogOut size={14} /> Logout
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center text-xs no-underline">Sign In</Link>
                    <Link to="/rooms" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center text-xs no-underline">Book Now</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
