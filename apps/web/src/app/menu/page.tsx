'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, getImageUrl } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { StaggerContainer, StaggerItem, HoverCard, Toast, FlyToCartAnimation } from '@/components/Animations';
import styles from './menu.module.css';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  isAvailable: boolean;
  categoryId: { _id: string; name: string; slug: string } | string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState(initialCat);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '' });
  // Fly animation state
  const [flyAnim, setFlyAnim] = useState<{ x: number; y: number; image?: string } | null>(null);

  useEffect(() => {
    api<Category[]>('/categories?activeOnly=true').then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('availableOnly', 'true');
    if (activeCat) {
      const cat = categories.find((c) => c.slug === activeCat);
      if (cat) params.set('categoryId', cat._id);
    }
    if (search) params.set('search', search);

    api<{ products: Product[] }>(`/products?${params}`)
      .then((res) => setProducts(res.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCat, search, categories]);

  const quickAdd = useCallback((product: Product, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyAnim({
      x: rect.left + rect.width / 2 - 30,
      y: rect.top,
      image: product.images[0],
    });

    addItem({
      productId: product._id,
      name: product.name,
      price: product.basePrice,
      quantity: 1,
      image: product.images[0],
      selectedOptions: [],
    });

    setToast({ show: true, message: `Đã thêm ${product.name} vào giỏ!` });
  }, [addItem]);

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  return (
    <div className={styles.menuPage}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1>Thực đơn</h1>
          <div className={styles.searchBar}>
            <input
              type="text"
              className="input"
              placeholder="🔍 Tìm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className={styles.catTabs}>
          <button
            className={`${styles.catTab} ${!activeCat ? styles.active : ''}`}
            onClick={() => setActiveCat('')}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`${styles.catTab} ${activeCat === cat.slug ? styles.active : ''}`}
              onClick={() => setActiveCat(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${styles.productCard} skeleton`} style={{ height: 320 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <span>😕</span>
            <p>Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <StaggerContainer className={styles.grid}>
            {products.map((product) => (
              <StaggerItem key={product._id}>
                <HoverCard className={styles.productCard}>
                  <Link href={`/menu/${product.slug}`} className={styles.productImage}>
                    {product.images[0] ? (
                      <img src={getImageUrl(product.images[0])} alt={product.name} />
                    ) : (
                      <div className={styles.placeholder}>🍽️</div>
                    )}
                  </Link>
                  <div className={styles.productInfo}>
                    <Link href={`/menu/${product.slug}`}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </Link>
                    <p className={styles.productDesc}>{product.description}</p>
                    <div className={styles.productMeta}>
                      {product.averageRating > 0 && (
                        <span className={styles.rating}>⭐ {product.averageRating}</span>
                      )}
                      <span className={styles.reviews}>({product.reviewCount} đánh giá)</span>
                    </div>
                    <div className={styles.productFooter}>
                      <span className={styles.price}>{formatPrice(product.basePrice)}</span>
                      <button className="btn btn-primary btn-sm" onClick={(e) => quickAdd(product, e)}>
                        + Thêm
                      </button>
                    </div>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
      />

      {/* Fly to Cart Animation */}
      {flyAnim && (
        <FlyToCartAnimation
          startX={flyAnim.x}
          startY={flyAnim.y}
          image={getImageUrl(flyAnim.image!)}
          onComplete={() => setFlyAnim(null)}
        />
      )}
    </div>
  );
}
