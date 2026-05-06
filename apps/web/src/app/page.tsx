'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeInView, StaggerContainer, StaggerItem } from '@/components/Animations';
import RecommendationCarousel from '@/components/RecommendationCarousel';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

export default function HomePage() {
  const { user } = useAuth();
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <motion.span
              className={styles.heroBadge}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              🔥 Miễn phí giao hàng
            </motion.span>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Đồ ăn ngon,
              <br />
              <span className={styles.heroHighlight}>giao tận nơi</span>
            </motion.h1>
            <motion.p
              className={styles.heroDesc}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Gà rán giòn rụm, burger thơm lừng, đồ uống mát lạnh — tất cả chỉ cách bạn vài cú click.
            </motion.p>
            <motion.div
              className={styles.heroCTA}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/menu" className="btn btn-primary btn-lg">
                Xem thực đơn →
              </Link>
              {!user && (
                <Link href="/auth/register" className="btn btn-outline btn-lg">
                  Đăng ký ngay
                </Link>
              )}
            </motion.div>
            <motion.div
              className={styles.heroStats}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className={styles.stat}>
                <strong>500+</strong>
                <span>Đơn hàng/ngày</span>
              </div>
              <div className={styles.stat}>
                <strong>4.8★</strong>
                <span>Đánh giá</span>
              </div>
              <div className={styles.stat}>
                <strong>15 phút</strong>
                <span>Giao hàng TB</span>
              </div>
            </motion.div>
          </div>
          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring', damping: 15 }}
          >
            <div className={styles.heroEmoji}>🍔</div>
            <motion.div
              className={styles.floatingItem}
              style={{ top: '10%', right: '10%' }}
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              🍗
            </motion.div>
            <motion.div
              className={styles.floatingItem}
              style={{ bottom: '20%', left: '5%' }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.5 }}
            >
              🥤
            </motion.div>
            <motion.div
              className={styles.floatingItem}
              style={{ top: '40%', right: '0%' }}
              animate={{ y: [0, -14, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 1 }}
            >
              🍟
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AI Recommendations */}
      <RecommendationCarousel />

      {/* Categories Preview */}
      <section className={styles.section}>
        <div className="container">
          <FadeInView>
            <h2 className={styles.sectionTitle}>Danh mục phổ biến</h2>
          </FadeInView>
          <StaggerContainer className={styles.catGrid}>
            {[
              { emoji: '🍗', name: 'Gà rán', slug: 'ga-ran' },
              { emoji: '🍔', name: 'Burger', slug: 'burger' },
              { emoji: '🍚', name: 'Cơm & Mì', slug: 'com-mi' },
              { emoji: '🥤', name: 'Đồ uống', slug: 'do-uong' },
              { emoji: '🍰', name: 'Tráng miệng', slug: 'trang-mieng' },
              { emoji: '🎉', name: 'Combo', slug: 'combo' },
            ].map((cat) => (
              <StaggerItem key={cat.slug}>
                <Link href={`/menu?category=${cat.slug}`} className={styles.catCard}>
                  <span className={styles.catEmoji}>{cat.emoji}</span>
                  <span className={styles.catName}>{cat.name}</span>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <FadeInView>
            <h2 className={styles.sectionTitle}>Tại sao chọn FoodStore?</h2>
          </FadeInView>
          <div className={styles.featGrid}>
            {[
              { icon: '⚡', title: 'Giao hàng nhanh', desc: 'Đơn hàng được xử lý và giao đến bạn trong thời gian ngắn nhất.' },
              { icon: '🏆', title: 'Tích điểm thưởng', desc: 'Mỗi 10,000đ = 1 điểm. Dùng điểm giảm giá đơn hàng tiếp theo!' },
              { icon: '💳', title: 'Thanh toán tiện lợi', desc: 'Chuyển khoản QR hoặc thanh toán khi nhận hàng — tùy bạn chọn.' },
              { icon: '🎁', title: 'Khuyến mãi hấp dẫn', desc: 'Voucher giảm giá liên tục. Nhập mã WELCOME10 để giảm ngay 10%!' },
            ].map((feat, i) => (
              <FadeInView key={feat.title} delay={i * 0.1}>
                <div className={styles.featCard}>
                  <span className={styles.featIcon}>{feat.icon}</span>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <FadeInView>
        <section className={styles.cta}>
          <div className="container">
            <div className={styles.ctaCard}>
              <h2>Đói bụng rồi? 🤤</h2>
              <p>Đặt món ngay để nhận ưu đãi đặc biệt cho thành viên mới!</p>
              <Link href="/menu" className="btn btn-primary btn-lg">
                Gọi món ngay →
              </Link>
            </div>
          </div>
        </section>
      </FadeInView>
    </>
  );
}
