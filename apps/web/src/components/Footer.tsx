'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand Section */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>🍔 FoodStore</Link>
          <p className={styles.desc}>
            Trải nghiệm ẩm thực tuyệt vời ngay tại nhà. Chúng tôi cam kết mang đến những món ăn tươi ngon, nóng hổi và giao hàng trong thời gian ngắn nhất.
          </p>
          <div className={styles.socials}>
            <a href="#" className={styles.socialIcon} aria-label="Facebook">fb</a>
            <a href="#" className={styles.socialIcon} aria-label="Instagram">ig</a>
            <a href="#" className={styles.socialIcon} aria-label="Twitter">tw</a>
            <a href="#" className={styles.socialIcon} aria-label="YouTube">yt</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.section}>
          <h4>Khám phá</h4>
          <ul className={styles.linkList}>
            <li><Link href="/menu">Thực đơn chính</Link></li>
            <li><Link href="/menu?category=ga-ran">Gà rán giòn</Link></li>
            <li><Link href="/menu?category=burger">Burger & Sandwiches</Link></li>
            <li><Link href="/menu?category=combo">Combo tiết kiệm</Link></li>
            <li><Link href="/promotions">Khuyến mãi mới</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className={styles.section}>
          <h4>Hỗ trợ</h4>
          <ul className={styles.linkList}>
            <li><Link href="/about">Về chúng tôi</Link></li>
            <li><Link href="/contact">Liên hệ</Link></li>
            <li><Link href="/faq">Câu hỏi thường gặp</Link></li>
            <li><Link href="/terms">Điều khoản sử dụng</Link></li>
            <li><Link href="/privacy">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div className={styles.section}>
          <h4>Liên hệ</h4>
          <div className={styles.contactInfo}>
            <p><span className={styles.icon}>📞</span> 0901 234 567</p>
            <p><span className={styles.icon}>📧</span> contact@foodstore.vn</p>
            <p><span className={styles.icon}>📍</span> 123 Nguyễn Huệ, Q.1, TP.HCM</p>
            <p><span className={styles.icon}>⏰</span> 08:00 - 22:00 (Mỗi ngày)</p>
          </div>
          
          <div className={styles.newsletter}>
            <p>Nhận tin khuyến mãi mới nhất:</p>
            <form className={styles.subscribeForm} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email của bạn..." required />
              <button type="submit" className={styles.subscribeBtn}>Gửi</button>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p>© 2026 FoodStore. Phát triển bởi đội ngũ CNPM. Bảo lưu mọi quyền.</p>
          <div className={styles.payments}>
            <span title="Visa">💳</span>
            <span title="Mastercard">🎴</span>
            <span title="Momo">🧧</span>
            <span title="Cash">💵</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
