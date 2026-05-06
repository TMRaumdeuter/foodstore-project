import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../lib/api';
import { Pagination } from '../components/Pagination';
import InvoiceEditorModal from '../components/InvoiceEditorModal';

export default function Orders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editingInvoiceOrder, setEditingInvoiceOrder] = useState<any | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    const query = `?status=${statusFilter}&page=${page}&limit=10`;
    api(`/orders${statusFilter === 'all' ? '' : query.replace('?status=all', '')}`, { token })
      .then(res => {
        setOrders(res.orders || []);
        setTotalPages(Math.ceil((res.total || 0) / 10) || 1);
        setLoading(false);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
      const intv = setInterval(fetchOrders, 10000); // Poll every 10s
      return () => clearInterval(intv);
    }
  }, [token, statusFilter, page]);

  const StatusTab = ({ id, label }: { id: string, label: string }) => (
    <button 
      onClick={() => { setStatusFilter(id); setPage(1); }}
      style={{
        padding: '12px 24px',
        border: 'none',
        background: 'none',
        borderBottom: statusFilter === id ? '2px solid #DC2626' : 'none',
        color: statusFilter === id ? '#DC2626' : '#000000',
        cursor: 'pointer',
        fontWeight: statusFilter === id ? 'bold' : 'normal'
      }}
    >
      {label}
    </button>
  );

  const updateStatus = async (id: string, status: string) => {
    if (confirm(`Chuyển trạng thái đơn hàng thành: ${status}?`)) {
      try {
        await api(`/orders/${id}/status`, {
          method: 'PATCH',
          token: token!,
          body: JSON.stringify({ status })
        });
        fetchOrders();
      } catch (err) {
        alert('Lỗi cập nhật trạng thái');
      }
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Quản lý Đơn hàng</h1>

      <div style={{ display: 'flex', background: 'white', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <StatusTab id="all" label="Tất cả" />
        <StatusTab id="pending" label="Chờ xử lý" />
        <StatusTab id="confirmed" label="Đã xác nhận" />
        <StatusTab id="preparing" label="Đang chuẩn bị" />
        <StatusTab id="delivering" label="Đang giao" />
        <StatusTab id="completed" label="Hoàn thành" />
        <StatusTab id="cancelled" label="Đã hủy" />
      </div>
      
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', marginBottom: '16px' }}>
        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#000000' }}>Đang tải dữ liệu...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: '16px' }}>Mã đơn</th>
              <th style={{ padding: '16px' }}>Khách hàng</th>
              <th style={{ padding: '16px' }}>Tổng tiền</th>
              <th style={{ padding: '16px' }}>Thanh toán</th>
              <th style={{ padding: '16px' }}>Trạng thái</th>
              <th style={{ padding: '16px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                <td style={{ padding: '16px', fontWeight: 'bold' }}>{o.orderCode}</td>
                <td style={{ padding: '16px' }}>{o.userId?.name}<br/><small style={{color: '#000000'}}>{o.deliveryAddress || 'Chưa có địa chỉ'}</small></td>
                <td style={{ padding: '16px', color: '#DC2626', fontWeight: 'bold' }}>{(o.totalPrice || 0).toLocaleString()}đ</td>
                <td style={{ padding: '16px' }}>
                  {o.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {o.status === 'pending' && (
                      <>
                        {o.paymentMethod === 'qr_transfer' ? (
                          <button 
                            onClick={() => updateStatus(o._id, 'confirmed')}
                            style={{ padding: '6px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Xác nhận Thanh toán
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateStatus(o._id, 'confirmed')}
                            style={{ padding: '6px 12px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Xác nhận
                          </button>
                        )}
                        <button 
                          onClick={() => updateStatus(o._id, 'cancelled')}
                          style={{ padding: '6px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Hủy
                        </button>
                      </>
                    )}
                    {o.status === 'confirmed' && (
                      <>
                        <button 
                          onClick={() => updateStatus(o._id, 'preparing')}
                          style={{ padding: '6px 12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Chuẩn bị
                        </button>
                        <button 
                          onClick={() => updateStatus(o._id, 'cancelled')}
                          style={{ padding: '6px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Hủy
                        </button>
                      </>
                    )}
                    {o.status === 'preparing' && (
                      <button 
                        onClick={() => updateStatus(o._id, 'delivering')}
                        style={{ padding: '6px 12px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Giao hàng
                      </button>
                    )}
                    {o.status === 'delivering' && (
                      <button 
                        onClick={() => updateStatus(o._id, 'completed')}
                        style={{ padding: '6px 12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Hoàn thành
                      </button>
                    )}
                    {(o.status === 'completed' || o.status === 'cancelled') && (
                      <span style={{ 
                        fontSize: '12px', padding: '4px 8px', borderRadius: '4px', 
                        background: o.status === 'completed' ? '#D1FAE5' : '#F3F4F6',
                        color: o.status === 'completed' ? '#065F46' : '#000000'
                      }}>
                        {o.status === 'completed' ? 'Đã giao' : 'Đã hủy'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <button 
                    onClick={() => setEditingInvoiceOrder(o)}
                    style={{ padding: '6px 12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    In Hóa đơn
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {editingInvoiceOrder && (
        <InvoiceEditorModal 
          order={editingInvoiceOrder} 
          onClose={() => setEditingInvoiceOrder(null)} 
        />
      )}
    </div>
  );
}
