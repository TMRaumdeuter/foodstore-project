'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import styles from './orders.module.css';

interface Order {
  _id: string;
  orderCode: string;
  totalPrice: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api<{ orders: Order[] }>('/orders/my-orders', { token })
        .then(res => setOrders(res.orders))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning">Chờ xử lý</span>;
      case 'delivering': return <span className="badge badge-info" style={{background: '#DBEAFE', color: '#1E40AF'}}>Đang giao</span>;
      case 'completed': return <span className="badge badge-success">Đã hoàn thành</span>;
      case 'cancelled': return <span className="badge badge-error">Đã hủy</span>;
      case 'cancel_requested': return <span className="badge badge-warning">Yêu cầu hủy</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  if (!user) return null;

  return (
    <div className={`container ${styles.ordersPage}`}>
      <h1 className={styles.pageTitle}>Lịch sử đơn hàng</h1>
      
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : orders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📦</div>
          <h2>Bạn chưa có đơn hàng nào</h2>
          <Link href="/menu" className="btn btn-primary mt-4">Bắt đầu đặt món</Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map(order => (
            <div key={order._id} className={styles.orderCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>Đơn hàng #{order.orderCode}</h3>
                  <p className={styles.date}>{formatDate(order.createdAt)}</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span>Thanh toán:</span>
                  <strong>{order.paymentMethod === 'cash' ? 'Tiền mặt (COD)' : 'Chuyển khoản QR'}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Tổng tiền:</span>
                  <strong className={styles.total}>{formatPrice(order.totalPrice)}</strong>
                </div>
              </div>
              
              <div className={styles.cardFooter}>
                <Link href={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                  Xem chi tiết & Theo dõi
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
