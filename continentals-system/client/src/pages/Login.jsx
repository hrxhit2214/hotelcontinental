import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, BedDouble, UtensilsCrossed, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login, register } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!name) { setError('Please enter your name.'); setLoading(false); return; }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80"
          alt="Continentals Hotel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-continental-primary/90 via-continental-primary/50 to-continental-primary/30" />

        {/* Branding Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-14">
          <div>
            <Link to="/" className="no-underline">
              <span className="text-white text-xl font-bold tracking-tight">Continentals</span>
            </Link>
          </div>

          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={12} className="text-yellow-400" />
                <span className="text-white/80 text-[11px] font-semibold tracking-wider uppercase">Guest Portal</span>
              </div>

              <h2 className="text-white text-4xl font-bold leading-tight mb-4">
                Your Gateway to<br />
                <span className="italic text-continental-accent-light">Luxury Living</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-md mb-10">
                Access exclusive bookings, personalized dining experiences, and premium parking services — all from your personal dashboard.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: BedDouble, label: 'Room Booking' },
                  { icon: UtensilsCrossed, label: 'Fine Dining' },
                  { icon: Car, label: 'Parking' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
                  >
                    <item.icon size={14} className="text-white/70" />
                    <span className="text-white/80 text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <p className="text-white/30 text-xs">
            © 2024 Continentals Hotel. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 lg:max-w-2xl flex items-center justify-center px-6 sm:px-12 lg:px-20 pt-24 lg:pt-0 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10">
            <Link to="/" className="text-continental-primary text-xl font-bold no-underline">Continentals</Link>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold mb-3">
              {isSignup ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-continental-text-light text-sm leading-relaxed">
              {isSignup
                ? 'Join Continentals to unlock exclusive bookings and premium services.'
                : 'Sign in to manage your bookings, dining orders, and more.'
              }
            </p>
          </div>

          {/* Sign In / Sign Up Toggle */}
          <div className="flex bg-continental-border-light/70 rounded-xl p-1.5 mb-10">
            <button
              onClick={() => { setIsSignup(false); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                !isSignup
                  ? 'bg-white text-continental-primary shadow-sm'
                  : 'text-continental-text-light hover:text-continental-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignup(true); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isSignup
                  ? 'bg-white text-continental-primary shadow-sm'
                  : 'text-continental-text-light hover:text-continental-text'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 text-red-600 text-sm px-5 py-3.5 rounded-xl mb-8 border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-2.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-continental-text-light" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="input-field pl-12 py-3.5 text-sm rounded-xl"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-2.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-continental-text-light" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-12 py-3.5 text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-2.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-continental-text-light" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-12 pr-12 py-3.5 text-sm rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-continental-text-light hover:text-continental-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 rounded-xl text-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-10 p-5 bg-continental-border-light/50 rounded-xl border border-continental-border/50">
            <p className="text-xs font-semibold text-continental-text-light mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-continental-text-light">Guest</span>
                <code className="text-xs bg-white px-2.5 py-1 rounded-lg font-mono border border-continental-border/50">john@example.com / guest123</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-continental-text-light">Admin</span>
                <code className="text-xs bg-white px-2.5 py-1 rounded-lg font-mono border border-continental-border/50">admin@continentals.com / admin123</code>
              </div>
            </div>
          </div>

          {/* Admin Link */}
          <div className="mt-8 text-center">
            <Link to="/admin/login" className="text-continental-text-light text-xs hover:text-continental-accent transition-colors no-underline">
              Looking for the Admin Portal? →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
