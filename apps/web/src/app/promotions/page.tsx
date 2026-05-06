'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './promotions.module.css';

interface Voucher {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
}

export default function PromotionsPage() {
  const { token } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Voucher[]>('/vouchers/active', { token: token || undefined })
      .then(data => {
        setVouchers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  return (
    <div className={`container ${styles.promoPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎁 Chương trình Khuyến mãi</h1>
        <p className={styles.subtitle}>Săn ngay voucher xịn để thưởng thức món ngon với giá cực hời!</p>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải ưu đãi...</div>
      ) : vouchers.length === 0 ? (
        <div className={styles.empty}>
          <p>Hiện tại chưa có mã giảm giá nào. Quay lại sau nhé!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {vouchers.map(v => (
            <div key={v._id} className={styles.card}>
              <div className={styles.left}>
                <div className={styles.discount}>
                  {v.discountType === 'percent' ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                </div>
                <div className={styles.tag}>OFF</div>
              </div>
              <div className={styles.right}>
                <h3 className={styles.vName}>{v.name || 'Mã giảm giá hấp dẫn'}</h3>
                <p className={styles.vDesc}>{v.description || `Giảm ngay ${v.discountType === 'percent' ? v.discountValue + '%' : formatPrice(v.discountValue)} cho đơn hàng từ ${formatPrice(v.minOrderAmount)}`}</p>
                <div className={styles.footer}>
                  <div className={styles.codeBox}>
                    Mã: <span className={styles.code}>{v.code}</span>
                  </div>
                  <div className={styles.expiry}>
                    Hết hạn: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <button 
                  className={styles.copyBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(v.code);
                    alert('Đã sao chép mã: ' + v.code);
                  }}
                >
                  Sao chép mã
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
