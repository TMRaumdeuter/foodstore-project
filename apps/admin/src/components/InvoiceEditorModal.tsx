import React, { useState } from 'react';
import { api, useAuth } from '../lib/api';

interface InvoiceEditorModalProps {
  order: any;
  onClose: () => void;
}

export default function InvoiceEditorModal({ order, onClose }: InvoiceEditorModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    orderCode: order.orderCode || '',
    createdAt: order.createdAt || new Date().toISOString(),
    customerName: order.userId?.name || '',
    deliveryAddress: order.deliveryAddress || '',
    subtotal: order.subtotal || 0,
    discountAmount: order.discountAmount || 0,
    pointsUsed: order.pointsUsed || 0,
    pointsDiscount: order.pointsDiscount || 0,
    totalPrice: order.totalPrice || 0,
    items: order.items ? JSON.parse(JSON.stringify(order.items)) : []
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: 'Sản phẩm mới', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('http://localhost:4000/api/invoices/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${formData.orderCode || 'custom'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      onClose();
    } catch (err) {
      alert('Lỗi xuất file PDF');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', borderRadius: '12px', padding: '24px', width: '800px', maxWidth: '90vw',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
        >
          ✕
        </button>
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Chỉnh sửa Hóa đơn</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Tên khách hàng</label>
            <input 
              type="text" 
              value={formData.customerName} 
              onChange={e => setFormData({ ...formData, customerName: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Địa chỉ</label>
            <input 
              type="text" 
              value={formData.deliveryAddress} 
              onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Mã đơn</label>
            <input 
              type="text" 
              value={formData.orderCode} 
              onChange={e => setFormData({ ...formData, orderCode: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px' }}>Sản phẩm</h3>
        {formData.items.map((item: any, idx: number) => (
          <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
            <input 
              type="text" 
              value={item.name} 
              onChange={e => handleItemChange(idx, 'name', e.target.value)}
              style={{ flex: 2, padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
              placeholder="Tên sản phẩm"
            />
            <input 
              type="number" 
              value={item.quantity} 
              onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))}
              style={{ flex: 1, padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
              placeholder="SL"
            />
            <input 
              type="number" 
              value={item.price} 
              onChange={e => handleItemChange(idx, 'price', Number(e.target.value))}
              style={{ flex: 1, padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
              placeholder="Đơn giá"
            />
            <button 
              onClick={() => removeItem(idx)}
              style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Xóa
            </button>
          </div>
        ))}
        <button 
          onClick={addItem}
          style={{ background: '#F3F4F6', color: '#000000', border: '1px solid #D1D5DB', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginBottom: '24px' }}
        >
          + Thêm sản phẩm
        </button>

        <h3 style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px' }}>Tổng kết</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Tạm tính (đ)</label>
            <input 
              type="number" 
              value={formData.subtotal} 
              onChange={e => setFormData({ ...formData, subtotal: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Giảm giá (đ)</label>
            <input 
              type="number" 
              value={formData.discountAmount} 
              onChange={e => setFormData({ ...formData, discountAmount: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px' }}>Tổng tiền (đ)</label>
            <input 
              type="number" 
              value={formData.totalPrice} 
              onChange={e => setFormData({ ...formData, totalPrice: Number(e.target.value) })}
              style={{ width: '100%', padding: '8px', border: '1px solid #D1D5DB', borderRadius: '4px', fontWeight: 'bold' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button 
            onClick={onClose}
            style={{ padding: '10px 20px', background: 'white', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer' }}
          >
            Hủy
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            style={{ padding: '10px 20px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: isExporting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {isExporting ? 'Đang xuất...' : 'Xuất file PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
