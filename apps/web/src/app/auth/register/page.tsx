'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <span className={styles.authLogo}>🍔</span>
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản để đặt món yêu thích!</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className="label" htmlFor="name">Họ tên</label>
            <input id="name" name="name" className="input" placeholder="Nguyễn Văn A" value={form.name} onChange={onChange} required />
          </div>
          <div className={styles.field}>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" placeholder="email@example.com" value={form.email} onChange={onChange} required />
          </div>
          <div className={styles.field}>
            <label className="label" htmlFor="phone">Số điện thoại</label>
            <input id="phone" name="phone" className="input" placeholder="0901234567" value={form.phone} onChange={onChange} />
          </div>
          <div className={styles.field}>
            <label className="label" htmlFor="password">Mật khẩu</label>
            <input id="password" name="password" type="password" className="input" placeholder="Tối thiểu 6 ký tự" value={form.password} onChange={onChange} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className={styles.authFooter}>
          Đã có tài khoản? <Link href="/auth/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
