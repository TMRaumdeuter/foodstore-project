import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../lib/api';

export default function Vouchers() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 0,
    maxDiscount: 0,
    minOrderAmount: 0,
    usageLimit: 100,
    expiresAt: '',
    isActive: true,
  });

  const fetchVouchers = () => {
    api('/vouchers', { token })
      .then(res => {
        setVouchers(Array.isArray(res) ? res : res.vouchers || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchVouchers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/vouchers/${editingId}` : '/vouchers';

      await api(endpoint, {
        method,
        token: token!,
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          expiresAt: new Date(formData.expiresAt).toISOString(),
        }),
      });

      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchVouchers();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu voucher');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percent',
      discountValue: 0,
      maxDiscount: 0,
      minOrderAmount: 0,
      usageLimit: 100,
      expiresAt: '',
      isActive: true,
    });
  };

  const openEdit = (v: any) => {
    setEditingId(v._id);
    setFormData({
      code: v.code,
      discountType: v.discountType,
      discountValue: v.discountValue,
      maxDiscount: v.maxDiscount || 0,
      minOrderAmount: v.minOrderAmount || 0,
      usageLimit: v.usageLimit,
      expiresAt: v.expiresAt ? new Date(v.expiresAt).toISOString().split('T')[0] : '',
      isActive: v.isActive,
    });
    setShowModal(true);
  };

  const deleteVoucher = async (id: string, code: string) => {
    if (window.confirm(`Xóa voucher "${code}"?`)) {
      try {
        await api(`/vouchers/${id}`, { method: 'DELETE', token: token! });
        fetchVouchers();
      } catch (err) {
        alert('Lỗi khi xóa voucher');
      }
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Voucher</h1>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          style={{ padding: '10px 16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm Voucher
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '20px' }}>Đang tải...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '16px' }}>Mã</th>
                <th style={{ padding: '16px' }}>Giảm giá</th>
                <th style={{ padding: '16px' }}>Đơn tối thiểu</th>
                <th style={{ padding: '16px' }}>Sử dụng</th>
                <th style={{ padding: '16px' }}>Hết hạn</th>
                <th style={{ padding: '16px' }}>Trạng thái</th>
                <th style={{ padding: '16px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map(v => (
                <tr key={v._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '14px' }}>{v.code}</td>
                  <td style={{ padding: '16px', color: '#DC2626', fontWeight: 'bold' }}>
                    {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString()}đ`}
                    {v.maxDiscount > 0 && <div style={{ fontSize: '11px', color: '#000000' }}>Tối đa: {v.maxDiscount.toLocaleString()}đ</div>}
                  </td>
                  <td style={{ padding: '16px' }}>{v.minOrderAmount ? `${v.minOrderAmount.toLocaleString()}đ` : '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontWeight: 'bold' }}>{v.usedCount || 0}</span>
                    <span style={{ color: '#000000' }}> / {v.usageLimit}</span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px' }}>
                    {v.expiresAt ? (
                      <span style={{ color: isExpired(v.expiresAt) ? '#DC2626' : '#000000' }}>
                        {new Date(v.expiresAt).toLocaleDateString('vi-VN')}
                        {isExpired(v.expiresAt) && ' (Hết hạn)'}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      background: v.isActive && !isExpired(v.expiresAt) ? '#D1FAE5' : '#F3F4F6',
                      color: v.isActive && !isExpired(v.expiresAt) ? '#065F46' : '#000000',
                    }}>
                      {v.isActive && !isExpired(v.expiresAt) ? 'Hoạt động' : 'Không khả dụng'}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => openEdit(v)} style={{ marginRight: '8px', padding: '6px 12px', border: '1px solid #D1D5DB', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
                      Sửa
                    </button>
                    <button onClick={() => deleteVoucher(v._id, v.code)} style={{ padding: '6px 12px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', borderRadius: '4px', cursor: 'pointer' }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingId ? 'Cập nhật Voucher' : 'Thêm Voucher mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Mã voucher</label>
                <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', textTransform: 'uppercase' }} required placeholder="VD: GIAM20" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Loại giảm giá</label>
                  <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value as 'percent' | 'fixed' })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}>
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Giá trị giảm</label>
                  <input type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required min={0} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Giảm tối đa (đ)</label>
                  <input type="number" value={formData.maxDiscount} onChange={e => setFormData({ ...formData, maxDiscount: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} min={0} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Đơn tối thiểu (đ)</label>
                  <input type="number" value={formData.minOrderAmount} onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} min={0} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Giới hạn sử dụng</label>
                  <input type="number" value={formData.usageLimit} onChange={e => setFormData({ ...formData, usageLimit: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} min={1} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ngày hết hạn</label>
                  <input type="date" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                  <span>Kích hoạt ngay</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingId ? 'Cập nhật' : 'Tạo Voucher'}
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
