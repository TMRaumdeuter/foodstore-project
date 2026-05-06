import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', padding: '16px' }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px',
          border: '1px solid #D1D5DB',
          background: currentPage === 1 ? '#F3F4F6' : 'white',
          color: currentPage === 1 ? '#000000' : '#000000',
          borderRadius: '6px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
        }}
      >
        Trước
      </button>

      <span style={{ fontSize: '14px', fontWeight: '500', color: '#000000' }}>
        Trang {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          border: '1px solid #D1D5DB',
          background: currentPage === totalPages ? '#F3F4F6' : 'white',
          color: currentPage === totalPages ? '#000000' : '#000000',
          borderRadius: '6px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
        }}
      >
        Sau
      </button>
    </div>
  );
};
