import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, useAuth, getImageUrl } from '../lib/api';
import { ImageUpload } from '../components/ImageUpload';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  const fetchData = () => {
    if (token && id) {
      Promise.all([
        api(`/products/${id}`, { token }),
        api(`/reviews/product/${id}`, { token })
      ]).then(([p, r]) => {
        const productWithId = {
          ...p,
          categoryId: p.categoryId?._id || p.categoryId
        };
        setProduct(p);
        setEditForm(productWithId);
        setReviews(r.reviews || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, token]);

  const handleUpdateProduct = async () => {
    try {
      await api(`/products/${id}`, {
        method: 'PUT',
        token: token!,
        body: JSON.stringify(editForm)
      });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      alert('Lỗi khi cập nhật sản phẩm');
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (window.confirm('Xóa đánh giá này?')) {
      try {
        await api(`/reviews/${reviewId}`, { method: 'DELETE', token: token! });
        setReviews(reviews.filter(r => r._id !== reviewId));
      } catch (err) {
        alert('Lỗi khi xóa');
      }
    }
  };

  const addOption = () => {
    const newOptions = [...(editForm.options || [])];
    newOptions.push({ name: 'Tên tùy chọn', choices: [{ label: 'Giá trị', extraPrice: 0 }] });
    setEditForm({ ...editForm, options: newOptions });
  };

  const removeOption = (idx: number) => {
    const newOptions = [...editForm.options];
    newOptions.splice(idx, 1);
    setEditForm({ ...editForm, options: newOptions });
  };

  const addOptionValue = (optIdx: number) => {
    const newOptions = [...editForm.options];
    newOptions[optIdx].choices.push({ label: 'Giá trị mới', extraPrice: 0 });
    setEditForm({ ...editForm, options: newOptions });
  };

  const removeOptionValue = (optIdx: number, valIdx: number) => {
    const newOptions = [...editForm.options];
    newOptions[optIdx].choices.splice(valIdx, 1);
    setEditForm({ ...editForm, options: newOptions });
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải...</div>;
  if (!product) return <div style={{ padding: '20px' }}>Không tìm thấy sản phẩm</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          onClick={() => navigate('/products')}
          style={{ background: 'none', border: 'none', color: '#000000', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          ← Quay lại danh sách
        </button>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          style={{ padding: '8px 16px', background: isEditing ? '#000000' : '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa sản phẩm'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginBottom: '40px' }}>
        {/* Basic Info */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <img 
            src={getImageUrl(product.images[0]) || 'https://via.placeholder.com/300'} 
            alt={product.name} 
            style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }} 
          />
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <ImageUpload 
                token={token!} 
                shape="square"
                value={editForm.images?.[0]}
                onUploadSuccess={(url) => setEditForm({ ...editForm, images: [url, ...(editForm.images || [])] })} 
              />
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #D1D5DB' }} />
              <input type="number" value={editForm.basePrice} onChange={e => setEditForm({ ...editForm, basePrice: Number(e.target.value) })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #D1D5DB' }} />
              <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #D1D5DB', height: '100px' }} />
              <button onClick={handleUpdateProduct} style={{ padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Lưu thay đổi</button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '24px', margin: '0 0 8px' }}>{product.name}</h1>
              <p style={{ color: '#DC2626', fontSize: '20px', fontWeight: 'bold', margin: '0 0 16px' }}>{product.basePrice.toLocaleString()}đ</p>
              <div style={{ fontSize: '14px', color: '#000000', lineHeight: '1.6' }}>{product.description}</div>
            </>
          )}
        </div>

        {/* Options & Reviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Options Management */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>Tùy chọn sản phẩm (Size, Topping...)</h2>
              {isEditing && (
                <button onClick={addOption} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ Thêm nhóm tùy chọn</button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(isEditing ? editForm.options : product.options || []).map((opt: any, optIdx: number) => (
                <div key={optIdx} style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    {isEditing ? (
                      <input 
                        value={opt.name} 
                        onChange={e => {
                          const newOpts = [...editForm.options];
                          newOpts[optIdx].name = e.target.value;
                          setEditForm({ ...editForm, options: newOpts });
                        }}
                        style={{ fontWeight: 'bold', padding: '4px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ fontWeight: 'bold' }}>{opt.name}</div>
                    )}
                    {isEditing && (
                      <button onClick={() => removeOption(optIdx)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa nhóm</button>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {opt.choices.map((v: any, valIdx: number) => (
                      <div key={valIdx} style={{ 
                        padding: '6px 12px', background: '#F3F4F6', borderRadius: '20px', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        {isEditing ? (
                          <>
                            <input value={v.label} onChange={e => {
                              const newOpts = [...editForm.options];
                              newOpts[optIdx].choices[valIdx].label = e.target.value;
                              setEditForm({ ...editForm, options: newOpts });
                            }} style={{ width: '80px', background: 'transparent', border: 'none', borderBottom: '1px solid #000000' }} />
                            <input type="number" value={v.extraPrice} onChange={e => {
                              const newOpts = [...editForm.options];
                              newOpts[optIdx].choices[valIdx].extraPrice = Number(e.target.value);
                              setEditForm({ ...editForm, options: newOpts });
                            }} style={{ width: '60px', background: 'transparent', border: 'none', borderBottom: '1px solid #000000' }} />
                            <button onClick={() => removeOptionValue(optIdx, valIdx)} style={{ color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                          </>
                        ) : (
                          <span>{v.label} (+{v.extraPrice.toLocaleString()}đ)</span>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button onClick={() => addOptionValue(optIdx)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px dashed #3B82F6', color: '#3B82F6', background: 'none', cursor: 'pointer', fontSize: '13px' }}>+ Thêm giá trị</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Đánh giá từ khách hàng</h2>
            {reviews.length === 0 ? (
              <p style={{ color: '#000000' }}>Chưa có đánh giá nào cho sản phẩm này.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map(r => (
                  <div key={r._id} style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold' }}>{r.userId?.name}</div>
                      <div style={{ color: '#F59E0B' }}>{'⭐'.repeat(r.rating)}</div>
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: '14px' }}>{r.comment}</p>
                    <button 
                      onClick={() => deleteReview(r._id)}
                      style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                    >
                      Xóa đánh giá này
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
