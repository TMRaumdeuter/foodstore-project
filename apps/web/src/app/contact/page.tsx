'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './contact.module.css';

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send');
      alert('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm nhất.');
      setFormData(prev => ({ ...prev, message: '' }));
    } catch (err) {
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className={`container ${styles.contactPage}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>📞 Liên hệ với chúng tôi</h1>
        <p className={styles.subtitle}>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.info}>
          <div className={styles.infoCard}>
            <div className={styles.icon}>📍</div>
            <div>
              <h3>Địa chỉ</h3>
              <p>123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.icon}>📱</div>
            <div>
              <h3>Số điện thoại</h3>
              <p>0123 456 789</p>
            </div>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.icon}>📧</div>
            <div>
              <h3>Email</h3>
              <p>support@foodstore.vn</p>
            </div>
          </div>
        </div>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Họ và tên</label>
              <input 
                name="name" 
                type="text" 
                placeholder="Nhập tên của bạn" 
                required 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                name="email" 
                type="email" 
                placeholder="Nhập email của bạn" 
                required 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Lời nhắn</label>
              <textarea 
                name="message" 
                placeholder="Bạn cần hỗ trợ gì?" 
                rows={5} 
                required
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className={styles.submitBtn}>Gửi tin nhắn</button>
          </form>
        </div>
      </div>
    </div>
  );
}
