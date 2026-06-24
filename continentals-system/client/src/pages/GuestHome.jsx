import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Users, Search, BedDouble, Car, UtensilsCrossed, Star, ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';
import { api } from '../utils/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function GuestHome() {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.getRooms().then(data => {
      setRooms(data.rooms.filter(r => r.status === 'available').slice(0, 4));
      setStats(data.stats);
    }).catch(() => {});
  }, []);

  const roomTypes = [
    { type: 'suite', label: 'Luxury Suites', icon: '👑', desc: 'High-end premium rooms with integrated lounge spaces' },
    { type: 'king', label: 'King Rooms', icon: '🛏️', desc: 'Standard layout focused on premium comfort' },
    { type: 'sea-facing', label: 'Sea Facing', icon: '🌊', desc: 'Premium rooms with breathtaking ocean views' },
    { type: 'family', label: 'Family Suites', icon: '👨‍👩‍👧‍👦', desc: 'Multi-room interconnected layouts for families' },
  ];

  return (
    <div className="min-h-screen">
      {/* ====== HERO SECTION ====== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
            alt="Continentals Hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-continental-primary/85 via-continental-primary/55 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-32 w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Premium Hospitality Since 1924</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold text-white leading-[1.08] mb-8">
              A Sanctuary of Refined{' '}
              <span className="italic text-continental-accent-light">Comfort</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg text-white/70 max-w-xl mb-12 leading-relaxed">
              Discover unparalleled luxury at Continentals. Where every detail is curated to exceed expectations and every moment becomes an unforgettable memory.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link to="/rooms" className="btn-primary text-sm py-3.5 px-7 no-underline">
                <BedDouble size={18} /> Explore Rooms
              </Link>
              <a href="#rooms" className="btn-secondary !border-white/30 !text-white hover:!bg-white/10 text-sm py-3.5 px-7 no-underline">
                Learn More <ArrowRight size={16} />
              </a>
            </motion.div>
          </motion.div>

          {/* Floating Booking Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-20 booking-bar max-w-5xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="booking-field">
                <label>Check In</label>
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-continental-accent shrink-0" />
                  <input type="date" />
                </div>
              </div>
              <div className="booking-field">
                <label>Check Out</label>
                <div className="flex items-center gap-3">
                  <CalendarDays size={16} className="text-continental-accent shrink-0" />
                  <input type="date" />
                </div>
              </div>
              <div className="booking-field">
                <label>Guests</label>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-continental-accent shrink-0" />
                  <select>
                    <option>1 Guest</option>
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>
              </div>
              <div className="flex items-end">
                <Link to="/rooms" className="btn-primary w-full justify-center py-4 no-underline text-sm">
                  <Search size={16} /> Check Availability
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== ROOM TYPES ====== */}
      <section id="rooms" className="section-gap-lg bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} className="text-continental-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4">Accommodations</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-6">Curated Room Experiences</motion.h2>
            <motion.p variants={fadeUp} className="text-continental-text-light max-w-2xl mx-auto text-base leading-relaxed">
              Choose from our carefully designed room categories, each crafted to provide a unique experience of luxury and comfort.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {roomTypes.map((rt) => (
              <motion.div key={rt.type} variants={fadeUp}>
                <Link to={`/rooms?type=${rt.type}`} className="card block p-10 text-center group no-underline">
                  <div className="text-5xl mb-6">{rt.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-continental-primary">{rt.label}</h3>
                  <p className="text-continental-text-light text-sm mb-6 leading-relaxed">{rt.desc}</p>
                  <span className="text-continental-accent text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Rooms <ArrowRight size={14} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== FEATURED ROOMS ====== */}
      {rooms.length > 0 && (
        <section className="section-gap-lg bg-continental-bg">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex items-end justify-between mb-14"
            >
              <div>
                <motion.p variants={fadeUp} className="text-continental-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4">Featured</motion.p>
                <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold">Signature Rooms</motion.h2>
              </div>
              <motion.div variants={fadeUp}>
                <Link to="/rooms" className="btn-secondary text-xs no-underline">
                  View All <ArrowRight size={14} />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {rooms.map(room => (
                <motion.div key={room.id} variants={fadeUp}>
                  <div className="card group">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-info">{room.type.replace('-', ' ')}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                        <div className="text-white">
                          <p className="text-xs opacity-80">{room.sqft} sq ft · Up to {room.capacity} guests</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2">{room.name}</h3>
                      <p className="text-continental-text-light text-xs mb-4">Room {room.number} · Floor {room.floor}</p>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-2xl font-bold text-continental-primary">₹{room.currentPrice}</span>
                          <span className="text-continental-text-light text-xs"> /night</span>
                        </div>
                        <Link to="/rooms" className="btn-primary text-xs py-2.5 px-4 no-underline">Book</Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ====== SERVICES ====== */}
      <section className="section-gap-lg bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} className="text-continental-accent text-sm font-semibold uppercase tracking-[0.2em] mb-4">Services</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {[
              { icon: Car, title: 'Smart Parking', desc: 'Real-time parking lot visualization with instant stall reservation. Find and secure your spot before you arrive.', link: '/parking', cta: 'View Parking Map' },
              { icon: UtensilsCrossed, title: 'Fine Dining', desc: 'Award-winning cuisine with A La Carte and curated Buffet experiences. Order directly to your room or table.', link: '/dining', cta: 'Explore Menu' },
              { icon: Shield, title: 'Premium Service', desc: 'Dedicated concierge, 24/7 room service, spa & wellness center, and bespoke event planning for every guest.', link: '/rooms', cta: 'Learn More' },
            ].map((service, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="card p-10 text-center h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-continental-accent/10 flex items-center justify-center mx-auto mb-8">
                    <service.icon size={26} className="text-continental-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                  <p className="text-continental-text-light text-sm mb-8 flex-1 leading-relaxed">{service.desc}</p>
                  <Link to={service.link} className="text-continental-accent text-sm font-semibold inline-flex items-center gap-1 mx-auto no-underline hover:gap-2 transition-all">
                    {service.cta} <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== STATS BAR ====== */}
      <section className="py-20 bg-continental-primary">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center"
          >
            {[
              { value: '20+', label: 'Premium Rooms' },
              { value: '100', label: 'Parking Stalls' },
              { value: '4.9', label: 'Guest Rating', icon: Star },
              { value: '24/7', label: 'Concierge Service', icon: Clock },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  {stat.icon && <stat.icon size={32} className="text-continental-accent-light" />}
                  {stat.value}
                </div>
                <p className="text-slate-400 text-sm tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="section-gap-lg bg-white">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold mb-8 mx-auto">
              Ready to Experience <span className="italic text-continental-accent">Luxury</span>?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-continental-text-light text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Book your stay at Continentals and discover a world where elegance meets modern comfort. Your perfect escape awaits.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-5">
              <Link to="/rooms" className="btn-primary text-sm py-3.5 px-10 no-underline">
                Book Your Stay <ArrowRight size={16} />
              </Link>
              <Link to="/dining" className="btn-secondary text-sm py-3.5 px-10 no-underline">
                View Dining Menu
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
