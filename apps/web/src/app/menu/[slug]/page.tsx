'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api, getImageUrl } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { Toast, FlyToCartAnimation } from '@/components/Animations';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import { useAuth } from '@/contexts/AuthContext';
import styles from './product.module.css';

interface Option {
  name: string;
  choices: { label: string; extraPrice: number }[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  options: Option[];
  averageRating: number;
  reviewCount: number;
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { label: string; extraPrice: number }>>({});
  const [toast, setToast] = useState({ show: false, message: '' });
  const [flyAnim, setFlyAnim] = useState<{ x: number; y: number; image?: string } | null>(null);
  const [reviewKey, setReviewKey] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    api<Product>(`/products/by-slug/${params.slug}`)
      .then((p) => {
        setProduct(p);
        const defaults: Record<string, any> = {};
        p.options?.forEach((opt) => {
          if (opt.choices.length > 0) {
            defaults[opt.name] = opt.choices[0];
          }
        });
        setSelectedOptions(defaults);
      })
      .catch(() => {
        router.push('/menu');
      })
      .finally(() => setLoading(false));
  }, [params.slug, router]);

  if (loading) return <div className="container" style={{ padding: '40px 0' }}>Đang tải...</div>;
  if (!product) return null;

  const handleOptionChange = (optionName: string, choiceIndex: number) => {
    const choice = product.options.find(o => o.name === optionName)?.choices[choiceIndex];
    if (choice) {
      setSelectedOptions(prev => ({ ...prev, [optionName]: choice }));
    }
  };

  const currentExtraPrice = Object.values(selectedOptions).reduce((sum, choice) => sum + choice.extraPrice, 0);
  const currentTotal = (product.basePrice + currentExtraPrice) * quantity;

  const handleAddToCart = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyAnim({
      x: rect.left + rect.width / 2 - 30,
      y: rect.top - 30,
      image: product.images[0],
    });

    const formattedOptions = Object.entries(selectedOptions).map(([name, choice]) => ({
      name,
      choice: choice.label,
      extraPrice: choice.extraPrice,
    }));

    addItem({
      productId: product._id,
      name: product.name,
      price: product.basePrice,
      quantity,
      image: product.images[0],
      selectedOptions: formattedOptions,
    });
    
    setToast({ show: true, message: `Đã thêm ${product.name} vào giỏ hàng!` });
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

  return (
    <div className={`container ${styles.productPage}`}>
      <button className={styles.backBtn} onClick={() => router.back()}>
        ← Quay lại
      </button>

      <div className={styles.layout}>
        {/* Hình ảnh — animated entrance */}
        <motion.div
          className={styles.imageGallery}
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className={styles.mainImage}>
            {product.images[0] ? (
              <img src={getImageUrl(product.images[0])} alt={product.name} />
            ) : (
              <div className={styles.placeholder}>🍽️</div>
            )}
          </div>
        </motion.div>

        {/* Thông tin & Form chọn — animated entrance */}
        <motion.div
          className={styles.details}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          <h1 className={styles.title}>{product.name}</h1>
          <div className={styles.meta}>
            <span className={styles.price}>{formatPrice(product.basePrice)}</span>
            {product.averageRating > 0 && (
              <span className={styles.rating}>⭐ {product.averageRating} ({product.reviewCount} đánh giá)</span>
            )}
          </div>
          <p className={styles.desc}>{product.description}</p>

          <div className={styles.divider} />

          {/* Options */}
          {product.options?.map((opt) => (
            <div key={opt.name} className={styles.optionGroup}>
              <h3 className={styles.optionName}>{opt.name}</h3>
              <div className={styles.choices}>
                {opt.choices.map((choice, idx) => {
                  const isSelected = selectedOptions[opt.name]?.label === choice.label;
                  return (
                    <label 
                      key={idx} 
                      className={`${styles.choiceLabel} ${isSelected ? styles.choiceSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name={opt.name}
                        checked={isSelected}
                        onChange={() => handleOptionChange(opt.name, idx)}
                        className="sr-only"
                      />
                      <span className={styles.choiceText}>{choice.label}</span>
                      {choice.extraPrice > 0 && (
                        <span className={styles.choicePrice}>+{formatPrice(choice.extraPrice)}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Số lượng */}
          <div className={styles.quantityGroup}>
            <h3 className={styles.optionName}>Số lượng</h3>
            <div className={styles.quantityCtrl}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Total & Submit */}
          <div className={styles.actionGroup}>
            <div className={styles.totalWrap}>
              <span>Tổng cộng:</span>
              <strong className={styles.totalPrice}>{formatPrice(currentTotal)}</strong>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ width: '100%' }}>
              Thêm vào giỏ hàng
            </button>
          </div>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: user ? '1fr 1.5fr' : '1fr', gap: '48px' }}>
          {user && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Viết đánh giá</h2>
              <ReviewForm 
                productId={product._id} 
                onSubmitted={() => {
                  setReviewKey(prev => prev + 1);
                  setToast({ show: true, message: 'Cảm ơn bạn đã gửi đánh giá!' });
                }} 
              />
            </div>
          )}
          <div>
            <ReviewList key={reviewKey} productId={product._id} />
          </div>
        </div>
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
