import React, { useEffect, useState } from 'react';
import { api, useAuth } from '../lib/api';

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function Contacts() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      const data = await api('/contacts', { token: token! });
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchContacts();
  }, [token]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api(`/contacts/${id}/status`, {
        method: 'PATCH',
        token: token!,
        body: JSON.stringify({ status })
      });
      fetchContacts();
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  const deleteContact = async (id: string) => {
    if (window.confirm('Xóa tin nhắn này?')) {
      try {
        await api(`/contacts/${id}`, { method: 'DELETE', token: token! });
        fetchContacts();
        if (selectedContact?._id === id) setSelectedContact(null);
      } catch (err) {
        alert('Lỗi khi xóa');
      }
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Đang tải...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Tin nhắn từ khách hàng</h1>
      
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
            <tr>
              <th style={{ padding: '16px' }}>Khách hàng</th>
              <th style={{ padding: '16px' }}>Tin nhắn</th>
              <th style={{ padding: '16px' }}>Ngày gửi</th>
              <th style={{ padding: '16px' }}>Trạng thái</th>
              <th style={{ padding: '16px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map(c => (
              <tr key={c._id} style={{ borderBottom: '1px solid #E5E7EB', background: c.status === 'new' ? '#FFFBEB' : 'transparent' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: '#000000' }}>{c.email}</div>
                </td>
                <td style={{ padding: '16px', maxWidth: '300px' }}>
                  <div style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.message}
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '13px', color: '#000000' }}>
                  {new Date(c.createdAt).toLocaleString('vi-VN')}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                    background: c.status === 'new' ? '#FEE2E2' : '#D1FAE5',
                    color: c.status === 'new' ? '#991B1B' : '#065F46'
                  }}>
                    {c.status === 'new' ? 'MỚI' : 'ĐÃ ĐỌC'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setSelectedContact(c)}
                      style={{ padding: '6px 12px', border: '1px solid #3B82F6', background: 'white', color: '#3B82F6', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Xem chi tiết
                    </button>
                    <button 
                      onClick={() => deleteContact(c._id)}
                      style={{ padding: '6px 12px', border: '1px solid #EF4444', background: '#FEF2F2', color: '#EF4444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#000000' }}>
                  Chưa có tin nhắn nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedContact && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Chi tiết tin nhắn</h2>
              <button onClick={() => setSelectedContact(null)} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#000000' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '20px', padding: '16px', background: '#F9FAFB', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px' }}><strong>Người gửi:</strong> {selectedContact.name}</p>
              <p style={{ margin: '0 0 8px' }}><strong>Email:</strong> {selectedContact.email}</p>
              <p style={{ margin: 0 }}><strong>Ngày gửi:</strong> {new Date(selectedContact.createdAt).toLocaleString('vi-VN')}</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ marginBottom: '12px' }}>Nội dung:</h4>
              <div style={{ 
                padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', 
                minHeight: '100px', lineHeight: '1.6', color: '#000000', background: '#fff'
              }}>
                {selectedContact.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {selectedContact.status === 'new' && (
                <button 
                  onClick={() => updateStatus(selectedContact._id, 'read')}
                  style={{ padding: '12px 24px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Đánh dấu đã đọc
                </button>
              )}
              <button 
                onClick={() => setSelectedContact(null)}
                style={{ padding: '12px 24px', background: '#F3F4F6', color: '#000000', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
