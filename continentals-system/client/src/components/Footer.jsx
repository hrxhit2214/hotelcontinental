import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Heart, Globe, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-continental-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-white mb-4">Continentals</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              A sanctuary of refined comfort. Experience luxury redefined with world-class amenities and impeccable service.
            </p>
            <div className="flex gap-3">
              {[Heart, Globe, Send].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-continental-accent transition-colors duration-200">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Explore</h4>
            <ul className="space-y-3">
              {[
                { to: '/rooms', label: 'Our Rooms' },
                { to: '/parking', label: 'Parking' },
                { to: '/dining', label: 'Dining' },
                { to: '/login', label: 'My Account' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 text-sm hover:text-white transition-colors no-underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Services</h4>
            <ul className="space-y-3">
              {['Room Service', 'Spa & Wellness', 'Concierge', 'Event Planning', 'Airport Transfer'].map(item => (
                <li key={item}>
                  <span className="text-slate-400 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-continental-accent mt-0.5 shrink-0" />
                <p className="text-slate-400 text-sm">42 Ocean Boulevard, Coastal Bay, CA 90210</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-continental-accent shrink-0" />
                <p className="text-slate-400 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-continental-accent shrink-0" />
                <p className="text-slate-400 text-sm">stay@continentals.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Continentals Hotel. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 text-xs hover:text-slate-300 transition-colors no-underline">Privacy Policy</a>
            <a href="#" className="text-slate-500 text-xs hover:text-slate-300 transition-colors no-underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
