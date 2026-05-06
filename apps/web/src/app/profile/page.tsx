'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { ImageUpload } from '@/components/ImageUpload';

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Sync state when user data is loaded from AuthContext
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setMsg('');
    try {
      const payload: any = { name, email, address, phone, avatar };
      if (password) payload.password = password;

      await api('/users/me', {
        method: 'PUT',
        token,
        body: JSON.stringify(payload)
      });
      
      await refreshUser(); // Update global state immediately
      setMsg('✅ Cập nhật thông tin thành công!');
      setPassword('');
    } catch (err: any) {
      setMsg('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="container" style={{ padding: '40px 0' }}>Vui lòng đăng nhập để xem thông tin.</div>;

  return (
    <div className="container" style={{ padding: '40px 0', maxWidth: '700px' }}>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '800' }}>Tài khoản của tôi</h1>
      
      <div className="card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
          {avatar ? (
            <img src={avatar.startsWith('http') ? avatar : `http://localhost:4000${avatar}`} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', background: 'var(--color-primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              {name.charAt(0)}
            </div>
          )}
          <div>
            <h2 style={{ fontSize: '20px' }}>{name}</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>{email}</p>
            <div className="badge badge-warning" style={{ marginTop: '8px' }}>
              🌟 {user.loyaltyPoints} điểm thưởng
            </div>
          </div>
        </div>

        {msg && <div style={{ padding: '15px', background: msg.startsWith('✅') ? '#ecfdf5' : '#fef2f2', color: msg.startsWith('✅') ? '#065f46' : '#991b1b', marginBottom: '20px', borderRadius: '8px', border: '1px solid currentColor' }}>{msg}</div>}

        <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="label">Ảnh đại diện</label>
            {token && <ImageUpload value={avatar} onChange={setAvatar} token={token} />}
          </div>
          
          <div>
            <label className="label">Họ và tên</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Số điện thoại</label>
            <input type="text" className="input" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="label">Mật khẩu mới (để trống nếu không đổi)</label>
            <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="label">Địa chỉ mặc định</label>
            <textarea className="input" value={address} onChange={e => setAddress(e.target.value)} rows={2} style={{ height: 'auto', padding: '10px' }} />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ gridColumn: 'span 2' }}>
            {loading ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
