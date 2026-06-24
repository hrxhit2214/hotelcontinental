import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, ArrowRight, Star, BedDouble, Car, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== 'admin') {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-1 bg-continental-primary relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
            alt="Hotel Lobby"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-continental-primary via-continental-primary/90 to-blue-900/80" />
        </div>

        {/* Branding Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Link to="/" className="no-underline">
              <h2 className="text-white text-2xl font-bold tracking-tight">Continentals</h2>
            </Link>
            <span className="badge bg-continental-accent/20 text-continental-accent-light text-[10px] mt-2 inline-block">
              Management Portal
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-white text-4xl font-bold leading-tight mb-6">
              Command Centre for <span className="italic text-continental-accent-light">Excellence</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-12">
              Monitor operations, manage bookings, control dynamic pricing, and ensure every guest receives an extraordinary experience.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4">
              {[
                { icon: BedDouble, label: 'Room Management', desc: '20 luxury rooms across 4 categories' },
                { icon: Car, label: 'Parking Control', desc: '100 stalls with live allocation map' },
                { icon: UtensilsCrossed, label: 'Dining Operations', desc: 'Menu management & order tracking' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-continental-accent/20 flex items-center justify-center shrink-0">
                    <feature.icon size={18} className="text-continental-accent-light" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{feature.label}</p>
                    <p className="text-slate-500 text-xs">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-slate-600 text-xs">
            © 2024 Continentals Hotel. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center p-8 bg-continental-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="no-underline">
              <h2 className="text-continental-primary text-xl font-bold">Continentals</h2>
            </Link>
          </div>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-continental-accent to-blue-700 flex items-center justify-center mb-8 shadow-lg shadow-continental-accent/20">
            <ShieldCheck size={28} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-continental-text-light text-sm mb-10">
            Sign in to access the admin management portal.
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 border border-red-100"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-continental-text-light" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@continentals.com"
                  className="input-field pl-11 py-3.5 text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-continental-text-light uppercase tracking-wider mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-continental-text-light" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-11 py-3.5 text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 rounded-xl text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>Access Portal <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-white rounded-xl border border-continental-border">
            <p className="text-xs text-continental-text-light mb-2 font-semibold uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-continental-text-light">Email</span>
                <code className="text-xs bg-continental-border-light px-2 py-0.5 rounded font-mono">admin@continentals.com</code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-continental-text-light">Password</span>
                <code className="text-xs bg-continental-border-light px-2 py-0.5 rounded font-mono">admin123</code>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-continental-text-light text-xs hover:text-continental-accent transition-colors no-underline">
              ← Back to main website
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
