import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, useAuth } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.user.role === 'customer') {
        throw new Error('Bạn không có quyền truy cập trang quản trị');
      }
      login(res.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundImage: 'url("/login-bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      {/* Overlay to darken background slightly for better focus */}
      <div style={{ 
        position: 'absolute', 
        top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        zIndex: 1 
      }} />

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', 
        width: '400px',
        zIndex: 10,
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '24px', 
          fontSize: '28px', 
          color: '#111827', // Strong black/dark gray
          fontWeight: '800'
        }}>
          Đăng nhập Admin
        </h1>
        
        {error && (
          <div style={{ 
            background: '#FEE2E2', 
            color: '#991B1B', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center',
            border: '1px solid #FECACA'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#000000' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #D1D5DB',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="admin@foodstore.vn"
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#000000' }}>Mật khẩu</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #D1D5DB',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit" 
            style={{ 
              padding: '14px', 
              background: '#111827', // Black background for button
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              fontSize: '16px',
              cursor: 'pointer', 
              marginTop: '10px',
              transition: 'background 0.3s',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#000000'}
            onMouseOut={(e) => e.currentTarget.style.background = '#111827'}
          >
            Đăng nhập hệ thống
          </button>
        </form>
      </div>
    </div>
  );
}
