import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api('/dashboard/stats', { token }),
      api('/dashboard/revenue', { token })
    ])
    .then(([statsData, revData]) => {
      setStats(statsData);
      // Format revenue for chart
      const chartData = revData.map((d: any) => ({
        date: d._id.split('-').slice(1).reverse().join('/'),
        total: d.totalRevenue
      }));
      setRevenue(chartData);
    })
    .catch(console.error);
  }, [token]);

  if (!stats) return <p>Đang tải...</p>;

  const StatCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', borderLeft: `6px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#000000', textTransform: 'uppercase' }}>{title}</h3>
      <div style={{ fontSize: '28px', fontWeight: '800', color: '#1F2937' }}>{value}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Tổng quan hệ thống</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
        <StatCard title="Tổng doanh thu" value={stats.totalRevenue.toLocaleString() + 'đ'} color="#10B981" />
        <StatCard title="Tổng đơn hàng" value={stats.totalOrders} color="#3B82F6" />
        <StatCard title="Đơn đang chờ" value={stats.pendingOrders} color="#F59E0B" />
        <StatCard title="Tổng khách hàng" value={stats.users.customer || 0} color="#8B5CF6" />
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '20px' }}>Doanh thu 30 ngày qua</h3>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(val) => `${val / 1000}k`} />
              <Tooltip formatter={(val: number) => val.toLocaleString() + 'đ'} />
              <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
