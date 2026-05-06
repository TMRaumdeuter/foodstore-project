'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

interface Review {
  _id: string;
  userId: { _id: string; name: string };
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
}

interface ReviewListProps {
  productId: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api<{ reviews: Review[]; total: number }>(`/reviews/product/${productId}?page=${page}&limit=5`)
      .then(res => {
        setReviews(res.reviews);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId, page]);

  if (loading && page === 1) {
    return <div style={{ padding: '20px 0', color: '#999' }}>Đang tải đánh giá...</div>;
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ filter: i < rating ? 'none' : 'grayscale(1) opacity(0.2)', fontSize: '16px' }}>⭐</span>
    ));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
        Đánh giá ({total})
      </h2>

      {reviews.length === 0 ? (
        <p style={{ color: '#999', fontSize: '14px' }}>Chưa có đánh giá nào cho sản phẩm này.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: '#f9fafb',
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  {review.userId?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{review.userId?.name || 'Khách'}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{formatDate(review.createdAt)}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>{renderStars(review.rating)}</div>
              </div>

              {review.comment && (
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#000000', margin: '8px 0' }}>
                  {review.comment}
                </p>
              )}

              {/* Review Images */}
              {review.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {review.images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setLightbox(getImageUrl(img))}
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '2px solid #e5e7eb',
                      }}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`Review ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {/* Pagination */}
          {total > 5 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Trước
              </button>
              <span style={{ alignSelf: 'center', fontSize: '14px', color: '#666' }}>
                Trang {page} / {Math.ceil(total / 5)}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 5)}
              >
                Tiếp →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
            }}
          >
            <motion.img
              src={lightbox}
              alt="Review photo"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                maxWidth: '90vw',
                maxHeight: '85vh',
                borderRadius: '12px',
                objectFit: 'contain',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
