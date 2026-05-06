import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../lib/api';

export default function Categories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', isActive: true });

  const fetchCategories = () => {
    api('/categories', { token }).then(setCategories).catch(console.error);
  };

  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/categories/${editingId}` : '/categories';
      
      await api(endpoint, {
        method,
        token: token!,
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', isActive: true });
      fetchCategories();
    } catch (err) {
      alert('Lỗi khi lưu danh mục');
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Xóa danh mục "${name}"?`)) {
      try {
        await api(`/categories/${id}`, { method: 'DELETE', token: token! });
        fetchCategories();
      } catch (err) {
        alert('Lỗi khi xóa');
      }
    }
  };

  const openEdit = (cat: any) => {
    setEditingId(cat._id);
    setFormData({ name: cat.name, slug: cat.slug, isActive: cat.isActive });
    setShowModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Danh mục</h1>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', slug: '', isActive: true }); setShowModal(true); }}
          style={{ padding: '10px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm danh mục
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: '16px' }}>Tên danh mục</th>
              <th style={{ padding: '16px' }}>Slug</th>
              <th style={{ padding: '16px' }}>Trạng thái</th>
              <th style={{ padding: '16px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{cat.name}</td>
                <td style={{ padding: '16px' }}>{cat.slug}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                    background: cat.isActive ? '#D1FAE5' : '#F3F4F6', color: cat.isActive ? '#065F46' : '#000000'
                  }}>
                    {cat.isActive ? 'Hoạt động' : 'Ẩn'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <button onClick={() => openEdit(cat)} style={{ marginRight: '8px', padding: '6px 12px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                    Sửa
                  </button>
                  <button onClick={() => deleteCategory(cat._id, cat.name)} style={{ padding: '6px 12px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', borderRadius: '4px', cursor: 'pointer' }}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingId ? 'Cập nhật Danh mục' : 'Thêm Danh mục mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tên danh mục</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Slug</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
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
