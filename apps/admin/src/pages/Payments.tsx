import React, { useEffect, useState } from 'react';
import { api, useAuth, getImageUrl } from '../lib/api';
import { ImageUpload } from '../components/ImageUpload';

export default function Payments() {
  const { token } = useAuth();
  const [qrs, setQrs] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    qrImageUrl: '',
    isActive: true
  });

  const fetchQRs = () => {
    api('/payments/qr/all', { token }).then(setQrs).catch(console.error);
  };

  useEffect(() => {
    if (token) fetchQRs();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/payments/qr/${editingId}` : '/payments/qr';
      
      await api(endpoint, {
        method,
        token: token!,
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchQRs();
    } catch (err) {
      alert('Lỗi khi lưu mã QR');
    }
  };

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountName: '',
      accountNumber: '',
      qrImageUrl: '',
      isActive: true
    });
  };

  const openEdit = (qr: any) => {
    setEditingId(qr._id);
    setFormData({
      bankName: qr.bankName,
      accountName: qr.accountName,
      accountNumber: qr.accountNumber,
      qrImageUrl: qr.qrImageUrl,
      isActive: qr.isActive
    });
    setShowModal(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api(`/payments/qr/${id}`, {
        method: 'PUT',
        token: token!,
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchQRs();
    } catch (err) {
      alert('Lỗi cập nhật');
    }
  };

  const deleteQR = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã QR này?')) {
      try {
        await api(`/payments/qr/${id}`, { method: 'DELETE', token: token! });
        fetchQRs();
      } catch (err) {
        alert('Lỗi xóa mã QR');
      }
    }
  };


  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Quản lý Mã QR Thanh toán</h1>
        <button 
          onClick={() => { setEditingId(null); resetForm(); setShowModal(true); }}
          style={{ padding: '10px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm Mã QR
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {qrs.map(qr => (
          <div key={qr._id} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ 
                padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                background: qr.isActive ? '#D1FAE5' : '#F3F4F6', color: qr.isActive ? '#065F46' : '#000000'
              }}>
                {qr.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
              </span>
              <div>
                <button onClick={() => openEdit(qr)} style={{ marginRight: '8px', cursor: 'pointer', border: 'none', background: 'none', color: '#3B82F6' }}>Sửa</button>
                <button onClick={() => toggleStatus(qr._id, qr.isActive)} style={{ marginRight: '8px', cursor: 'pointer', border: 'none', background: 'none', color: '#000000' }}>
                  {qr.isActive ? 'Tắt' : 'Bật'}
                </button>
                <button onClick={() => deleteQR(qr._id)} style={{ cursor: 'pointer', border: 'none', background: 'none', color: '#DC2626' }}>
                  Xóa
                </button>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ 
                width: '180px', height: '180px', margin: '0 auto', 
                overflow: 'hidden', borderRadius: '12px', border: '1px solid #E5E7EB',
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <img 
                  src={getImageUrl(qr.qrImageUrl)} 
                  alt="QR" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            </div>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p style={{ margin: '4px 0' }}>Ngân hàng: <strong>{qr.bankName}</strong></p>
              <p style={{ margin: '4px 0' }}>Chủ tài khoản: <strong>{qr.accountName}</strong></p>
              <p style={{ margin: '4px 0' }}>Số tài khoản: <strong>{qr.accountNumber}</strong></p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '450px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '24px' }}>{editingId ? 'Cập nhật Mã QR' : 'Thêm Mã QR mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tên Ngân hàng</label>
                <input type="text" value={formData.bankName} onChange={e => setFormData({ ...formData, bankName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required placeholder="Ví dụ: Vietcombank" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Tên chủ tài khoản</label>
                <input type="text" value={formData.accountName} onChange={e => setFormData({ ...formData, accountName: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required placeholder="NGUYEN VAN A" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Số tài khoản</label>
                <input type="text" value={formData.accountNumber} onChange={e => setFormData({ ...formData, accountNumber: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ảnh QR</label>
                <ImageUpload 
                  value={formData.qrImageUrl} 
                  shape="square"
                  onChange={(url) => setFormData({ ...formData, qrImageUrl: url })} 
                  token={token!}
                />
                {formData.qrImageUrl && <p style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>Đã tải ảnh lên thành công</p>}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Lưu thông tin
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
