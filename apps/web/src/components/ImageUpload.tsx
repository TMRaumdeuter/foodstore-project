'use client';

import React, { useState, useRef } from 'react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  token: string;
}

export function ImageUpload({ value, onChange, token }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use direct fetch to avoid JSON-related overhead in custom api helper
      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Lỗi khi tải ảnh lên');
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '3px solid #E5E7EB',
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          background: '#F3F4F6',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          style={{ display: 'none' }} 
          accept="image/*"
        />
        
        {loading ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
             <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #DC2626', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : value ? (
          <img 
            src={value.startsWith('http') ? value : `http://localhost:4000${value}`} 
            alt="Avatar" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#000000' }}>
            <span style={{ fontSize: '32px' }}>👤</span>
          </div>
        )}

        {/* Hover Overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '12px', fontWeight: 'bold'
        }}>
          SỬA
        </div>
      </div>

      {value && (
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(''); }}
          style={{
            background: 'none', border: 'none', color: '#EF4444', 
            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
            padding: '4px 8px', borderRadius: '4px', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          🗑️ Gỡ ảnh hiện tại
        </button>
      )}

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
