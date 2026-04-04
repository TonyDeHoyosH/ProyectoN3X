import React from 'react';

interface Props {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<Props> = ({ title, message, actionText, onAction }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '48px 24px', color: '#9ca3af', textAlign: 'center',
  }}>
    <span style={{ fontSize: '48px', marginBottom: '16px' }}>📦</span>
    <h3 style={{ margin: '0 0 8px', color: '#6b7280', fontSize: '18px' }}>{title}</h3>
    <p style={{ margin: '0 0 20px', fontSize: '14px' }}>{message}</p>
    {onAction && actionText && (
      <button
        onClick={onAction}
        style={{
          padding: '8px 20px', borderRadius: '6px', border: 'none',
          background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '14px',
        }}
      >
        {actionText}
      </button>
    )}
  </div>
);

export default EmptyState;
