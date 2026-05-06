import React, { useEffect, useState } from 'react';
import { api, useAuth, getImageUrl } from '../lib/api';
import { Pagination } from '../components/Pagination';
import { ImageUpload } from '../components/ImageUpload';
import { Link } from 'react-router-dom';

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    categoryId: '',
    images: [] as string[],
    isAvailable: true,
    options: [] as any[]
  });

  useEffect(() => {
    if (token) {
      fetchProducts();
      api('/categories').then(setCategories).catch(console.error);
    }
  }, [token, page]);

  const fetchProducts = () => {
    setLoading(true);
    api(`/products?page=${page}&limit=10`, { token })
      .then(res => {
        setProducts(res.products || []);
        setTotalPages(Math.ceil((res.total || 0) / 10) || 1);
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/products/${editingId}` : '/products';
      
      await api(endpoint, {
        method,
        token: token!,
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Lỗi khi lưu sản phẩm');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      categoryId: categories[0]?._id || '',
      images: [],
      isAvailable: true,
      options: []
    });
  };

  const openEdit = (p: any) => {
    setEditingId(p._id);
    setFormData({
      name: p.name,
      description: p.description || '',
      basePrice: p.basePrice,
      categoryId: p.categoryId?._id || p.categoryId,
      images: p.images || [],
      isAvailable: p.isAvailable,
      options: p.options || []
    });
    setShowModal(true);
  };

  const deleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) {
      try {
        await api(`/products/${id}`, { method: 'DELETE', token: token! });
        fetchProducts();
      } catch (err) {
        alert('Lỗi khi xóa sản phẩm');
      }
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      await api(`/products/${id}`, {
        method: 'PUT',
        token: token!,
        body: JSON.stringify({ isAvailable: !currentStatus })
      });
      fetchProducts();
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { name: '', values: [{ label: '', priceAdjustment: 0 }] }]
    });
  };

  const updateOption = (idx: number, name: string) => {
    const newOptions = [...formData.options];
    newOptions[idx].name = name;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Sản phẩm</h1>
        <button 
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          style={{ padding: '10px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm sản phẩm mới
        </button>
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: '16px' }}>Sản phẩm</th>
              <th style={{ padding: '16px' }}>Danh mục</th>
              <th style={{ padding: '16px' }}>Giá cơ bản</th>
              <th style={{ padding: '16px' }}>Trạng thái</th>
              <th style={{ padding: '16px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {p.images[0] ? (
                    <img src={getImageUrl(p.images[0])} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', background: '#F3F4F6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🍽️</div>
                  )}
                  <div>
                    <Link to={`/products/${p._id}`} style={{ fontWeight: 'bold', color: '#1F2937', textDecoration: 'none' }}>{p.name}</Link>
                    <div style={{ fontSize: '12px', color: '#000000' }}>Đánh giá: {p.averageRating > 0 ? p.averageRating : 'Chưa có'} ⭐</div>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>{categories.find(c => c._id === p.categoryId)?.name || 'N/A'}</td>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{p.basePrice.toLocaleString()}đ</td>
                <td style={{ padding: '16px' }}>
                  <button onClick={() => toggleAvailability(p._id, p.isAvailable)} style={{ padding: '4px 12px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', background: p.isAvailable ? '#D1FAE5' : '#FEE2E2', color: p.isAvailable ? '#065F46' : '#991B1B' }}>
                    {p.isAvailable ? 'Đang bán' : 'Hết hàng'}
                  </button>
                </td>
                <td style={{ padding: '16px' }}>
                  <Link 
                    to={`/products/${p._id}`}
                    style={{ marginRight: '8px', padding: '6px 12px', border: '1px solid #3B82F6', background: 'white', color: '#3B82F6', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '13px' }}
                  >
                    Chi tiết
                  </Link>
                  <button onClick={() => openEdit(p)} style={{ marginRight: '8px', padding: '6px 12px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                    Sửa
                  </button>
                  <button onClick={() => deleteProduct(p._id, p.name)} style={{ padding: '6px 12px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', borderRadius: '4px', cursor: 'pointer' }}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tên sản phẩm</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Giá cơ bản</label>
                  <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Danh mục</label>
                <select value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Mô tả</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', height: '80px' }} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hình ảnh sản phẩm</label>
                <ImageUpload 
                  token={token!} 
                  shape="square"
                  value={formData.images[0]}
                  onUploadSuccess={(url) => setFormData({ ...formData, images: [url, ...formData.images] })} 
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {formData.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative' }}>
                      <img src={getImageUrl(img)} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Lưu sản phẩm
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
