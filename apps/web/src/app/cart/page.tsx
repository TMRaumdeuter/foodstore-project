'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl } from '@/lib/api';
import styles from './cart.module.css';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart();

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyCart}`}>
        <div className={styles.emptyIcon}>🛒</div>
        <h1>Giỏ hàng trống</h1>
        <p>Bạn chưa chọn món nào. Hãy xem thực đơn và chọn món nhé!</p>
        <Link href="/menu" className="btn btn-primary btn-lg mt-4">
          Xem thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.cartPage}`}>
      <h1 className={styles.pageTitle}>Giỏ hàng của bạn ({totalItems} món)</h1>

      <div className={styles.layout}>
        {/* Danh sách món */}
        <div className={styles.itemList}>
          {items.map((item, index) => {
            const optionsExtra = item.selectedOptions.reduce((sum, o) => sum + o.extraPrice, 0);
            const itemTotal = (item.price + optionsExtra) * item.quantity;
            const uniqueKey = `${item.productId}-${index}`;

            return (
              <div key={uniqueKey} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  {item.image ? (
                    <img src={getImageUrl(item.image)} alt={item.name} />
                  ) : (
                    <div className={styles.placeholder}>🍽️</div>
                  )}
                </div>
                
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <div className={styles.itemOptions}>
                    {item.selectedOptions.map((opt, i) => (
                      <span key={i} className={styles.optionBadge}>
                        {opt.name}: {opt.choice} {opt.extraPrice > 0 ? `(+${formatPrice(opt.extraPrice)})` : ''}
                      </span>
                    ))}
                  </div>
                  <div className={styles.itemPriceBase}>
                    {formatPrice(item.price + optionsExtra)} / phần
                  </div>
                </div>

                <div className={styles.itemActions}>
                  <div className={styles.quantityCtrl}>
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <div className={styles.itemTotal}>{formatPrice(itemTotal)}</div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.productId)}>
                    🗑️ Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tóm tắt đơn hàng */}
        <div className={styles.summary}>
          <h2>Tóm tắt đơn hàng</h2>
          <div className={styles.summaryRow}>
            <span>Tạm tính</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className={styles.summaryRow}>
            <span>Phí giao hàng</span>
            <strong className={styles.free}>Miễn phí (dưới 1km)</strong>
          </div>
          <div className={styles.divider} />
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Tổng cộng</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Tiến hành thanh toán →
          </Link>
        </div>
      </div>
    </div>
  );
}
