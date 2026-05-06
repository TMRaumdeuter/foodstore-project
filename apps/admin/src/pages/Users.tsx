import React, { useEffect, useState } from 'react';
import { api, useAuth, getImageUrl } from '../lib/api';
import { Pagination } from '../components/Pagination';
import { ImageUpload } from '../components/ImageUpload';

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    loyaltyPoints: 0,
    address: '',
    avatar: ''
  });

  const fetchUsers = () => {
    setLoading(true);
    api(`/users?page=${page}&limit=10`, { token })
      .then(res => {
        setUsers(res.users || res || []);
        setTotalPages(Math.ceil((res.total || 0) / 10) || 1);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/users/${editingId}` : '/users';
      
      const payload = { ...formData };
      if (editingId && !payload.password) delete (payload as any).password;

      await api(endpoint, {
        method,
        token: token!,
        body: JSON.stringify(payload)
      });
      
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu người dùng');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'customer',
      loyaltyPoints: 0,
      address: '',
      avatar: ''
    });
  };

  const openEdit = (u: any) => {
    setEditingId(u._id);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      phone: u.phone || '',
      role: u.role,
      loyaltyPoints: u.loyaltyPoints || 0,
      address: u.address || '',
      avatar: u.avatar || ''
    });
    setShowModal(true);
  };

  const deleteUser = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}"?`)) {
      try {
        await api(`/users/${id}`, { method: 'DELETE', token: token! });
        fetchUsers();
      } catch (err) {
        alert('Lỗi khi xóa người dùng');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <span style={{ padding: '4px 8px', background: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Quản trị</span>;
      case 'staff': return <span style={{ padding: '4px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Nhân viên</span>;
      default: return <span style={{ padding: '4px 8px', background: '#DBEAFE', color: '#1E40AF', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Khách hàng</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Người dùng</h1>
        <button 
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          style={{ padding: '10px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm nhân viên
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '20px' }}>Đang tải...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '16px' }}>Họ tên / Email</th>
                <th style={{ padding: '16px' }}>Số điện thoại</th>
                <th style={{ padding: '16px' }}>Vai trò</th>
                <th style={{ padding: '16px' }}>Điểm thưởng</th>
                <th style={{ padding: '16px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: '#000000' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>{u.phone || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>{getRoleBadge(u.role)}</td>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{u.loyaltyPoints || 0} pts</td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => openEdit(u)} style={{ marginRight: '8px', padding: '6px 12px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                      Sửa
                    </button>
                    <button 
                      onClick={() => deleteUser(u._id, u.name)}
                      disabled={u.role === 'admin'}
                      style={{ 
                        padding: '6px 12px', 
                        border: '1px solid #FCA5A5', 
                        background: '#FEF2F2', 
                        color: '#DC2626', 
                        borderRadius: '4px', 
                        cursor: u.role === 'admin' ? 'not-allowed' : 'pointer',
                        opacity: u.role === 'admin' ? 0.5 : 1
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingId ? 'Cập nhật Người dùng' : 'Thêm Nhân viên mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Họ tên</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Mật khẩu {editingId && '(để trống nếu không đổi)'}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required={!editingId} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Vai trò</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}>
                    <option value="customer">Khách hàng</option>
                    <option value="staff">Nhân viên</option>
                    <option value="admin">Quản trị</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Điểm thưởng</label>
                  <input type="number" value={formData.loyaltyPoints} onChange={e => setFormData({ ...formData, loyaltyPoints: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Số điện thoại</label>
                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Địa chỉ</label>
                <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} rows={2} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ảnh đại diện</label>
                <ImageUpload 
                  value={formData.avatar} 
                  onChange={(val) => setFormData({ ...formData, avatar: val })} 
                  token={token!}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Lưu thay đổi
                </button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#000000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
