'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { CartBadge } from './Animations';
import styles from './Header.module.css';

export default function Header() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🍔</span>
          <span className={styles.logoText}>FoodStore</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="/menu" className={styles.navLink}>Thực đơn</Link>
          <Link href="/promotions" className={styles.navLink}>Khuyến mãi</Link>
          <Link href="/contact" className={styles.navLink}>Liên hệ</Link>
          {user && <Link href="/orders" className={styles.navLink}>Đơn hàng</Link>}
        </nav>

        <div className={styles.actions}>
          <Link href="/cart" className={styles.cartBtn} data-cart-icon style={{ position: 'relative' }}>
            🛒
            <CartBadge count={totalItems} />
          </Link>

          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span className={styles.avatar}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                <span className={styles.userName}>{user?.name || 'Khách'}</span>
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <Link href="/profile" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                    Tài khoản
                  </Link>
                  <Link href="/orders" className={styles.dropItem} onClick={() => setMenuOpen(false)}>
                    Đơn hàng
                  </Link>
                  <button className={styles.dropItem} onClick={() => { logout(); setMenuOpen(false); }}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="btn btn-primary btn-sm">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
