import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';
import GuestHome from './pages/GuestHome';
import Rooms from './pages/Rooms';
import Parking from './pages/Parking';
import Dining from './pages/Dining';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import RoomMgmt from './pages/admin/RoomMgmt';
import ParkingMgmt from './pages/admin/ParkingMgmt';
import DiningMgmt from './pages/admin/DiningMgmt';
import Pricing from './pages/admin/Pricing';
import Receipts from './pages/admin/Receipts';
import { useAuth } from './context/AuthContext';

function AdminLayout({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-continental-bg">
        <div className="text-continental-text-light animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-continental-bg">
        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-continental-text-light text-sm mb-4">You need admin privileges to access this portal.</p>
          <a href="/admin/login" className="btn-primary text-sm no-underline">Go to Admin Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-continental-bg">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function GuestLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isLoginPage = location.pathname === '/login' || location.pathname === '/admin/login';

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/rooms" element={<RoomMgmt />} />
          <Route path="/admin/parking" element={<ParkingMgmt />} />
          <Route path="/admin/dining" element={<DiningMgmt />} />
          <Route path="/admin/pricing" element={<Pricing />} />
          <Route path="/admin/receipts" element={<Receipts />} />
        </Routes>
      </AdminLayout>
    );
  }

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    );
  }

  return (
    <GuestLayout>
      <Routes>
        <Route path="/" element={<GuestHome />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/parking" element={<Parking />} />
        <Route path="/dining" element={<Dining />} />
      </Routes>
    </GuestLayout>
  );
}

export default function App() {
  return <AppRoutes />;
}
