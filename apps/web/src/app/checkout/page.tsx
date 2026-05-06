'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';
import styles from './checkout.module.css';

interface Voucher {
  _id: string;
  code: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { items, subtotal, clearCart, totalItems, isHydrated } = useCart();
  
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [qrCode, setQrCode] = useState<any>(null);

  // Fetch available vouchers & QR
  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
      return;
    }
    if (isHydrated && items.length === 0) {
      router.push('/cart');
      return;
    }
    
    // Fetch vouchers
    api<Voucher[]>('/vouchers/active', { token: token ?? undefined })
      .then(data => {
        setVouchers(Array.isArray(data) ? data : []);
      })
      .catch(console.error);

    // Fetch active payment QR
    api<any[]>('/payments/qr', { token: token ?? undefined })
      .then(data => {
        if (data && data.length > 0) setQrCode(data[0]);
      })
      .catch(console.error);
    
    if (user?.address) setAddress(user.address);
    if (user?.phone) setPhone(user.phone);
  }, [token, router, items, user]);

  // Calculate Discounts
  let voucherDiscount = 0;
  const appliedVoucher = vouchers.find(v => v.code === selectedVoucherCode);
  if (appliedVoucher && subtotal >= appliedVoucher.minOrderAmount) {
    if (appliedVoucher.discountType === 'fixed') {
      voucherDiscount = appliedVoucher.discountValue;
    } else {
      let calc = (subtotal * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscount && calc > appliedVoucher.maxDiscount) {
        calc = appliedVoucher.maxDiscount;
      }
      voucherDiscount = calc;
    }
  }

  let pointsDiscount = 0;
  let pointsToUse = 0;
  if (usePoints && user && user.loyaltyPoints > 0) {
    // 1 point = 1000 VNĐ
    const maxPointsNeeded = Math.ceil((subtotal - voucherDiscount) / 1000);
    pointsToUse = Math.min(user.loyaltyPoints, maxPointsNeeded);
    pointsDiscount = pointsToUse * 1000;
  }

  const finalTotal = Math.max(0, subtotal - voucherDiscount - pointsDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError('Vui lòng nhập địa chỉ giao hàng');
      return;
    }
    
    setLoading(true);
    setError('');

    const formattedItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price + item.selectedOptions.reduce((s, o) => s + o.extraPrice, 0),
      quantity: item.quantity,
      selectedOptions: item.selectedOptions.map(o => ({
        name: o.name,
        choice: o.choice,
        extraPrice: o.extraPrice,
      })),
    }));

    const mappedPaymentMethod = paymentMethod === 'cash' ? 'cod' : 'qr_transfer';

    try {
      const res = await api<{ _id: string }>('/orders', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          items: formattedItems.map(({ productId, quantity, selectedOptions }) => ({
            productId,
            quantity,
            selectedOptions
          })),
          deliveryAddress: address,
          phone,
          paymentMethod: mappedPaymentMethod,
          voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
          pointsUsed: pointsToUse,
          note,
        })
      });

      clearCart();
      router.push(`/orders/${res._id}`); // Redirect to order detail / tracking
    } catch (err: any) {
      setError(err.message || 'Đặt hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  if (!user) return null; // Wait for redirect

  return (
    <div className={`container ${styles.checkoutPage}`}>
      <h1 className={styles.pageTitle}>Thanh toán</h1>
      
      {error && <div className={styles.errorAlert}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.layout}>
        {/* Cột trái: Thông tin & Khuyến mãi */}
        <div className={styles.leftCol}>
          <div className={styles.section}>
            <h2>1. Thông tin giao hàng</h2>
            <div className={styles.field}>
              <label className="label">Họ tên</label>
              <input type="text" className="input" value={user.name} disabled />
            </div>
            <div className={styles.field}>
              <label className="label">Số điện thoại (*)</label>
              <input 
                type="text" 
                className="input" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                required 
              />
            </div>
            <div className={styles.field}>
              <label className="label">Địa chỉ giao hàng (*)</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện" 
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className="label">Ghi chú đơn hàng (Tùy chọn)</label>
              <textarea 
                className="input" 
                placeholder="VD: Không hành, ít cay..."
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>2. Phương thức thanh toán</h2>
            <div className={styles.radioGroup}>
              <label className={`${styles.radioLabel} ${paymentMethod === 'cash' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <span>💵 Tiền mặt khi nhận hàng (COD)</span>
              </label>
              <label className={`${styles.radioLabel} ${paymentMethod === 'transfer' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  value="transfer"
                  checked={paymentMethod === 'transfer'}
                  onChange={() => setPaymentMethod('transfer')}
                />
                <span>🏦 Chuyển khoản QR (Kiểm duyệt thủ công)</span>
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h2>3. Ưu đãi & Giảm giá</h2>
            
            {/* Vouchers */}
            <div className={styles.vouchers}>
              <h3 className={styles.subTitle}>Mã giảm giá</h3>
              {vouchers.length === 0 ? (
                <p className={styles.textMuted}>Chưa có mã giảm giá nào phù hợp.</p>
              ) : (
                <div className={styles.voucherList}>
                  <button 
                    type="button"
                    className={`${styles.voucherBtn} ${selectedVoucherCode === '' ? styles.activeVoucher : ''}`}
                    onClick={() => setSelectedVoucherCode('')}
                  >
                    Không dùng mã
                  </button>
                  {vouchers.map(v => {
                    const isEligible = subtotal >= v.minOrderAmount;
                    return (
                      <button 
                        key={v._id}
                        type="button"
                        disabled={!isEligible}
                        className={`${styles.voucherBtn} ${selectedVoucherCode === v.code ? styles.activeVoucher : ''}`}
                        onClick={() => setSelectedVoucherCode(v.code)}
                      >
                        <strong style={{ display: 'block' }}>{v.code}</strong>
                        <span>
                          Giảm {v.discountType === 'fixed' ? formatPrice(v.discountValue) : `${v.discountValue}%`}
                        </span>
                        {!isEligible && <small> (Đơn tối thiểu {formatPrice(v.minOrderAmount)})</small>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Loyalty Points */}
            <div className={styles.loyaltyBox}>
              <h3 className={styles.subTitle}>Điểm thưởng FoodStore</h3>
              <p className={styles.pointsText}>
                Bạn đang có <strong>{user?.loyaltyPoints || 0} điểm</strong>. 
                <br/>
                <em>(1 điểm = 1.000đ giảm giá)</em>
              </p>
              <label className={styles.pointsToggle}>
                <input 
                  type="checkbox" 
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  disabled={!user || !user.loyaltyPoints || user.loyaltyPoints === 0}
                />
                Dùng {usePoints ? pointsToUse : 0} điểm để giảm {formatPrice(usePoints ? pointsDiscount : 0)}
              </label>
            </div>
          </div>
        </div>

        {/* Cột phải: Bill Summary */}
        <div className={styles.rightCol}>
          <div className={styles.billBox}>
            <h2>Tóm tắt ({totalItems} món)</h2>
            <div className={styles.billItems}>
              {items.map((item, i) => (
                <div key={i} className={styles.billItemRow}>
                  <div className={styles.billItemName}>
                    {item.quantity}x {item.name}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.billRow}>
              <span>Tạm tính</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.billRow}>
              <span>Phí giao hàng</span>
              <span className={styles.greenText}>Miễn phí</span>
            </div>
            
            {voucherDiscount > 0 && (
              <div className={`${styles.billRow} ${styles.discountRow}`}>
                <span>Mã giảm giá ({appliedVoucher?.code})</span>
                <span>-{formatPrice(voucherDiscount)}</span>
              </div>
            )}
            
            {pointsDiscount > 0 && (
              <div className={`${styles.billRow} ${styles.discountRow}`}>
                <span>Dùng {pointsToUse} điểm</span>
                <span>-{formatPrice(pointsDiscount)}</span>
              </div>
            )}

            <div className={styles.divider} />

            <div className={styles.billTotalRow}>
              <span>Thành tiền</span>
              <strong className={styles.finalPrice}>{formatPrice(finalTotal)}</strong>
            </div>

            {paymentMethod === 'transfer' && qrCode && (
              <div style={{
                marginTop: '16px', padding: '16px', background: '#F9FAFB', borderRadius: '8px',
                border: '1px dashed #D1D5DB', textAlign: 'center'
              }}>
                <p style={{ fontSize: '13px', marginBottom: '8px', color: '#000000' }}>
                  Quét mã để thanh toán nhanh:
                </p>
                <div style={{ 
                  width: '180px', height: '180px', margin: '0 auto', 
                  overflow: 'hidden', borderRadius: '12px', border: '1px solid #E5E7EB',
                  background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img 
                    src={qrCode.qrImageUrl} 
                    alt="QR Thanh toán" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <p style={{ fontSize: '12px', marginTop: '8px', color: '#000000' }}>
                  {qrCode.bankName} - {qrCode.accountNumber}<br/>
                  <strong>{qrCode.accountName}</strong>
                </p>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
              {loading ? 'Đang xử lý...' : (paymentMethod === 'transfer' ? 'Gửi yêu cầu thanh toán' : 'Đặt hàng ngay')}
            </button>
            <p className={styles.termsText}>
              Bằng việc đặt hàng, bạn đồng ý với Điều khoản và Chính sách của FoodStore.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
