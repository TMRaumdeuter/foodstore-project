'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { api, getImageUrl } from '@/lib/api';
import styles from '../orders.module.css';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const { setContent } = useCart();
  
  const [order, setOrder] = useState<any>(null);
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Polling Real-time Update (Every 5 seconds)
  useEffect(() => {
    if (!token) return;

    const fetchOrder = async () => {
      try {
        const data = await api<any>(`/orders/${params.id}`, { token });
        setOrder(data);

        // Fetch QR Code if transfer
        if (data.paymentMethod === 'qr_transfer' && data.status === 'pending') {
          const qrData = await api<any[]>('/payments/qr', { token });
          if (qrData.length > 0) setQrCode(qrData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Polling 5s
    return () => clearInterval(interval);
  }, [params.id, token]);

  const handleReorder = () => {
    if (!order) return;
    
    const cartItems = order.items.map((item: any) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions || []
    }));

    setContent(cartItems);
    router.push('/checkout');
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const cancelReasons = [
    'Tôi muốn thay đổi món ăn',
    'Tôi nhập sai địa chỉ giao hàng',
    'Tôi tìm thấy giá rẻ hơn ở nơi khác',
    'Tôi không còn nhu cầu mua nữa',
    'Lý do khác'
  ];

  const handleRequestCancel = async () => {
    if (!cancelReason) {
      alert('Vui lòng chọn lý do hủy đơn');
      return;
    }
    try {
      await api(`/orders/${params.id}/request-cancel`, {
        method: 'POST',
        token,
        body: JSON.stringify({ reason: cancelReason })
      });
      setShowCancelModal(false);
      // fetchOrder will be called by interval or manually
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px 0' }}>Đang tải...</div>;
  if (!order) return <div className="container">Không tìm thấy đơn hàng.</div>;

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const steps = [
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'preparing', label: 'Đang chế biến' },
    { key: 'delivering', label: 'Đang giao hàng' },
    { key: 'completed', label: 'Hoàn thành' }
  ];
  
  let currentStepIndex = steps.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const isCancelRequested = order.status === 'cancel_requested';

  return (
    <div className={`container ${styles.ordersPage}`}>
      <button className={styles.backBtn} onClick={() => router.push('/orders')}>
        ← Lịch sử đơn hàng
      </button>

      <div className={styles.detailLayout}>
        <div className={styles.mainContent}>
          <div className={styles.headerBlock}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1>Chi tiết đơn hàng #{order.orderCode}</h1>
              {['pending', 'confirmed'].includes(order.status) && (
                <button 
                  className="btn btn-outline btn-sm" 
                  style={{ color: '#EF4444', borderColor: '#EF4444' }}
                  onClick={() => setShowCancelModal(true)}
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>

            {isCancelled ? (
              <div className="badge badge-error" style={{ marginTop: '10px', padding: '8px 16px' }}>Đơn hàng đã bị hủy</div>
            ) : isCancelRequested ? (
              <div className="badge badge-warning" style={{ marginTop: '10px', padding: '8px 16px' }}>Đang yêu cầu hủy đơn</div>
            ) : (
              <div className={styles.progress}>
                {steps.map((step, idx) => (
                  <div key={step.key} className={`${styles.step} ${idx <= currentStepIndex ? styles.stepActive : ''}`}>
                    <div className={styles.stepCircle}>{idx + 1}</div>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.infoCard}>
            <h3>Danh sách món ăn</h3>
            <div className={styles.orderItems}>
              {order.items.map((item: any, i: number) => (
                <div key={i} className={styles.itemRow}>
                  <div>
                    <strong>{item.quantity}x {item.name || item.productName}</strong>
                    <div className={styles.itemOptions}>
                      {item.selectedOptions && item.selectedOptions.map((opt: any, idx: number) => (
                        <span key={idx}>{opt.name}: {opt.choice}</span>
                      ))}
                    </div>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            <div className={styles.divider} />
            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Tổng tiền món:</span>
                <span>{formatPrice(order.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0))}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className={`${styles.totalRow} ${styles.discountText}`}>
                  <span>Giảm giá (Voucher + Điểm):</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                <span>Thành tiền:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className={styles.infoCard}>
            <h3>Thông tin giao hàng</h3>
            <p><strong>Người nhận:</strong> {order.userId.name}</p>
            <p><strong>Điện thoại:</strong> {order.userId.phone || order.phone}</p>
            <p><strong>Địa chỉ:</strong> {order.deliveryAddress}</p>
            {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
            {order.cancelReason && (
              <p style={{ marginTop: '10px', color: '#EF4444' }}>
                <strong>Lý do hủy:</strong> {order.cancelReason}
              </p>
            )}
          </div>
          
          <div className={styles.actions}>
            <button className="btn btn-outline" onClick={handleReorder}>Mua lại đơn này</button>
          </div>
        </div>

        {/* Sidebar (Thanh toán QR hoặc Hóa đơn) */}
        <div className={styles.sidebar}>
            {order.paymentMethod === 'qr_transfer' && order.status === 'pending' ? (
              <div className={styles.qrCard}>
                <h3>Yêu cầu thanh toán</h3>
                <p>Vui lòng quét mã QR dưới đây để thực hiện thanh toán. Sau khi chuyển khoản thành công, vui lòng đợi Admin xác nhận yêu cầu của bạn.</p>
                {qrCode ? (
                  <div className={styles.qrBox}>
                    <div style={{ 
                      width: '180px', height: '180px', margin: '0 auto 16px', 
                      overflow: 'hidden', borderRadius: '12px', border: '1px solid #E5E7EB',
                      background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <img 
                        src={getImageUrl(qrCode.qrImageUrl)} 
                        alt="QR Thanh toan" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <p className={styles.bankInfo}>
                      Ngân hàng: <strong>{qrCode.bankName}</strong><br/>
                      STK: <strong>{qrCode.accountNumber}</strong><br/>
                      Tên: <strong>{qrCode.accountName}</strong><br/>
                      Nội dung CK: <strong className={styles.highlight}>{order.orderCode}</strong>
                    </p>
                  </div>
                ) : (
                  <p>Đang tải mã QR...</p>
                )}
              </div>
            ) : order.paymentMethod === 'qr_transfer' && order.status !== 'pending' && order.status !== 'cancelled' ? (
              <div className={styles.qrCard} style={{ borderColor: '#10B981', background: '#F0FDF4' }}>
                <h3 style={{ color: '#059669' }}>✓ Đã xác nhận thành công</h3>
                <p style={{ fontSize: '14px', color: '#065F46' }}>
                  Admin đã xác nhận chuyển khoản thành công. Bạn có thể tiếp tục theo dõi trạng thái chế biến và giao hàng của đơn hàng này.
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '16px', background: '#10B981', border: 'none' }}
                  onClick={() => router.push('/orders')}
                >
                  Sang danh sách đơn hàng
                </button>
              </div>
            ) : (
              <div className={styles.qrCard}>
                <h3>Trạng thái thanh toán</h3>
                <p>
                  {order.paymentMethod === 'cod' ? 'Thanh toán tiền mặt khi nhận hàng.' : (order.status === 'cancelled' ? 'Đơn hàng đã bị hủy.' : 'Thanh toán chuyển khoản thành công.')}
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Lý do hủy đơn hàng</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {cancelReasons.map(reason => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason} 
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
              {cancelReason === 'Lý do khác' && (
                <textarea 
                  placeholder="Nhập lý do cụ thể..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  rows={2}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, background: '#EF4444', borderColor: '#EF4444' }}
                onClick={handleRequestCancel}
              >
                Gửi yêu cầu hủy
              </button>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setShowCancelModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
