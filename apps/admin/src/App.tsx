import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiUsers, FiBox, FiLogOut, FiCreditCard, FiList, FiStar, FiTag, FiMail } from 'react-icons/fi';
import { useAuth } from './lib/api';

// Mocks for now - We will create these pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Products from './pages/Products';
import Payments from './pages/Payments';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Reviews from './pages/Reviews';
import ProductDetails from './pages/ProductDetails';
import Vouchers from './pages/Vouchers';
import Contacts from './pages/Contacts';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navs = [
    { path: '/', label: 'Tổng quan', icon: <FiHome /> },
    { path: '/orders', label: 'Đơn hàng', icon: <FiShoppingBag /> },
    { path: '/categories', label: 'Danh mục', icon: <FiList /> },
    { path: '/products', label: 'Sản phẩm', icon: <FiBox /> },
    { path: '/vouchers', label: 'Voucher', icon: <FiTag /> },
    { path: '/contacts', label: 'Tin nhắn', icon: <FiMail /> },
    { path: '/users', label: 'Người dùng', icon: <FiUsers /> },
    { path: '/reviews', label: 'Đánh giá', icon: <FiStar /> },
    { path: '/payments', label: 'Mã QR', icon: <FiCreditCard /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#1F2937', color: 'white', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', fontSize: '20px', fontWeight: 'bold', borderBottom: '1px solid #374151' }}>
          🍔 Admin Panel
        </div>
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {navs.map(nav => (
            <Link 
              key={nav.path} 
              to={nav.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
                color: location.pathname === nav.path ? 'white' : '#9CA3AF',
                background: location.pathname === nav.path ? '#374151' : 'transparent',
                textDecoration: 'none'
              }}
            >
              {nav.icon} {nav.label}
            </Link>
          ))}
        </nav>
        <button 
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
            background: '#111827', color: '#EF4444', border: 'none', cursor: 'pointer', textAlign: 'left'
          }}
        >
          <FiLogOut /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: 'white', padding: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#000000' }}>Trang quản trị FoodStore</h2>
        </header>
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </main>
    </div>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/products/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/reviews" element={<PrivateRoute><Reviews /></PrivateRoute>} />
        <Route path="/vouchers" element={<PrivateRoute><Vouchers /></PrivateRoute>} />
        <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
