import React from 'react';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const getPageRange = (current: number, total: number): number[] => {
  const max = 5;
  let start = Math.max(1, current - Math.floor(max / 2));
  const end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  padding: '6px 12px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  border: '1px solid #ccc',
  borderRadius: '4px',
  background: 'transparent',
});

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = getPageRange(currentPage, totalPages);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <button
        style={btnStyle(currentPage === 1)}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Anterior
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            ...btnStyle(false),
            background: page === currentPage ? '#3b82f6' : 'transparent',
            color: page === currentPage ? '#fff' : 'inherit',
            fontWeight: page === currentPage ? 'bold' : 'normal',
            borderColor: page === currentPage ? '#3b82f6' : '#ccc',
          }}
        >
          {page}
        </button>
      ))}

      <button
        style={btnStyle(currentPage === totalPages)}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
      </button>

      <span style={{ marginLeft: '8px', fontSize: '14px', color: '#666' }}>
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
};

export default Pagination;
