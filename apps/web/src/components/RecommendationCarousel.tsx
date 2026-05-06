'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api, getImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Toast, FlyToCartAnimation } from './Animations';

interface Product {
  _id: string;
  name: string;
  slug: string;
  basePrice: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
}

export default function RecommendationCarousel() {
  const { user, token } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [flyAnim, setFlyAnim] = useState<{ x: number; y: number; image?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const endpoint = token ? '/recommendations' : '/recommendations/popular';
    const opts = token ? { token } : {};
    api<Product[]>(endpoint, opts)
      .then(setProducts)
      .catch(() => {
        // Fallback to popular
        api<Product[]>('/recommendations/popular')
          .then(setProducts)
          .catch(console.error);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || products.length === 0) return null;

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  const quickAdd = (product: Product, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyAnim({ x: rect.left, y: rect.top, image: product.images[0] });
    addItem({
      productId: product._id,
      name: product.name,
      price: product.basePrice,
      quantity: 1,
      image: product.images[0],
      selectedOptions: [],
    });
    setToast({ show: true, message: `Đã thêm ${product.name} vào giỏ!` });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth',
      });
    }
  };

  const title = token ? 'Gợi ý cho bạn 🎯' : 'Món được yêu thích 🔥';

  return (
    <section style={{ padding: '48px 0', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{title}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => scroll('left')}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1px solid #e5e7eb', background: '#fff',
                cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >←</button>
            <button
              onClick={() => scroll('right')}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '1px solid #e5e7eb', background: '#fff',
                cursor: 'pointer', fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >→</button>
          </div>
        </div>

        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingBottom: '8px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              style={{
                flexShrink: 0,
                width: '220px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#fff',
                border: '1px solid #f0f0f0',
                scrollSnapAlign: 'start',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <Link href={`/menu/${product.slug}`}>
                <div style={{
                  width: '100%',
                  height: '140px',
                  background: '#f3f4f6',
                  overflow: 'hidden',
                }}>
                  {product.images[0] ? (
                    <img
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '40px' }}>
                      🍽️
                    </div>
                  )}
                </div>
              </Link>
              <div style={{ padding: '12px' }}>
                <Link href={`/menu/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h4 style={{
                    fontSize: '14px', fontWeight: 600, margin: '0 0 4px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {product.name}
                  </h4>
                </Link>
                {product.averageRating > 0 && (
                  <div style={{ fontSize: '12px', color: '#f59e0b', marginBottom: '6px' }}>
                    ⭐ {product.averageRating} ({product.reviewCount})
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary, #e74c3c)', fontSize: '15px' }}>
                    {formatPrice(product.basePrice)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-primary btn-sm"
                    onClick={(e) => quickAdd(product, e)}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    +
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
      />
      {flyAnim && (
        <FlyToCartAnimation
          startX={flyAnim.x}
          startY={flyAnim.y}
          image={getImageUrl(flyAnim.image!)}
          onComplete={() => setFlyAnim(null)}
        />
      )}
    </section>
  );
}
