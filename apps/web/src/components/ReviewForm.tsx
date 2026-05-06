'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, apiUpload } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSubmitted: () => void;
}

export default function ReviewForm({ productId, orderId, onSubmitted }: ReviewFormProps) {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - images.length);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('productId', productId);
      if (orderId) formData.append('orderId', orderId);
      formData.append('rating', String(rating));
      formData.append('comment', comment);
      images.forEach(img => formData.append('images', img));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Gửi đánh giá thất bại');
      }

      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'Gửi đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {error && (
        <div style={{ color: '#ef4444', fontSize: '14px', padding: '8px 12px', background: '#fef2f2', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Đánh giá *</label>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <motion.button
              key={star}
              type="button"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '32px',
                filter: star <= displayRating ? 'none' : 'grayscale(1) opacity(0.3)',
                transition: 'filter 0.15s',
              }}
            >
              ⭐
            </motion.button>
          ))}
          <span style={{ alignSelf: 'center', marginLeft: '8px', fontSize: '14px', color: '#666' }}>
            {rating > 0 ? ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating] : ''}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Nhận xét</label>
        <textarea
          className="input"
          placeholder="Chia sẻ trải nghiệm của bạn về món ăn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Image Upload */}
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>
          Ảnh thực tế ({images.length}/3)
        </label>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <AnimatePresence>
            {previews.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{
                  position: 'relative',
                  width: '80px',
                  height: '80px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '2px solid #e5e7eb',
                }}
              >
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    lineHeight: '1',
                  }}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {images.length < 3 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '10px',
                border: '2px dashed #d1d5db',
                background: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#000000',
                gap: '2px',
              }}
            >
              <span style={{ fontSize: '20px' }}>📷</span>
              Thêm ảnh
            </motion.button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <motion.button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
      </motion.button>
    </form>
  );
}
