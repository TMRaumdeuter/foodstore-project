import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../lib/api';

export default function Reviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    api('/reviews', { token })
      .then(res => {
        setReviews(res.reviews || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (token) fetchReviews();
  }, [token]);

  const deleteReview = async (id: string) => {
    if (window.confirm('Xóa đánh giá này?')) {
      try {
        await api(`/reviews/${id}`, { method: 'DELETE', token: token! });
        fetchReviews();
      } catch (err) {
        alert('Lỗi khi xóa đánh giá');
      }
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Quản lý Đánh giá</h1>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ padding: '20px' }}>Đang tải...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '16px' }}>Sản phẩm</th>
                <th style={{ padding: '16px' }}>Khách hàng</th>
                <th style={{ padding: '16px' }}>Đánh giá</th>
                <th style={{ padding: '16px' }}>Bình luận</th>
                <th style={{ padding: '16px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '16px', fontWeight: 'bold' }}>{r.productId?.name}</td>
                  <td style={{ padding: '16px' }}>{r.userId?.name}</td>
                  <td style={{ padding: '16px', color: '#F59E0B' }}>
                    {'⭐'.repeat(r.rating)}
                  </td>
                  <td style={{ padding: '16px', maxWidth: '300px', fontSize: '14px' }}>{r.comment}</td>
                  <td style={{ padding: '16px' }}>
                    <button onClick={() => deleteReview(r._id)} style={{ padding: '6px 12px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', borderRadius: '4px', cursor: 'pointer' }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
