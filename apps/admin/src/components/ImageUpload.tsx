import React, { useState, useRef } from 'react';
import { API_URL } from '../lib/api';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onUploadSuccess?: (url: string) => void;
  token: string;
  shape?: 'circle' | 'square';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, onUploadSuccess, token, shape = 'circle' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Using fetch directly because api helper is for JSON
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      if (onChange) onChange(data.url);
      if (onUploadSuccess) onUploadSuccess(data.url);
    } catch (err) {
      alert('Lỗi khi tải ảnh lên');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const isSquare = shape === 'square';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          width: isSquare ? '100%' : '120px',
          height: isSquare ? '160px' : '120px',
          borderRadius: isSquare ? '12px' : '50%',
          border: `2px dashed ${dragOver ? '#3B82F6' : '#D1D5DB'}`,
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          background: dragOver ? '#F0F7FF' : '#F9FAFB',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: isSquare ? '12px' : '0'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          style={{ display: 'none' }} 
          accept="image/*"
        />
        
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
             <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
             <span style={{ fontSize: '12px', color: '#6B7280' }}>Đang tải...</span>
          </div>
        ) : value ? (
          <img 
            src={value.startsWith('http') ? value : `http://localhost:4000${value}`} 
            alt="Upload preview" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
            <span style={{ fontSize: '24px' }}>{isSquare ? '📷' : '👤'}</span>
            {isSquare && (
              <div style={{ fontSize: '13px' }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#000000' }}>Kéo thả ảnh vào đây</p>
                <p style={{ margin: 0, fontSize: '12px' }}>Hoặc nhấp để chọn file</p>
              </div>
            )}
          </div>
        )}

        {/* Hover Overlay */}
        {!isSquare && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px'
          }}>
            THAY ĐỔI
          </div>
        )}
      </div>

      {!isSquare && value && (
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); if (onChange) onChange(''); }}
          style={{
            background: 'none', border: 'none', color: '#EF4444', 
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            padding: '4px 8px', borderRadius: '4px', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
          onMouseOut={(e) => e.currentTarget.style.background = 'none'}
        >
          🗑️ Gỡ ảnh hiện tại
        </button>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
