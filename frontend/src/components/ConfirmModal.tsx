import React from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<Props> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: '8px',
          padding: '28px 32px',
          width: 'min(90vw, 420px)',
          zIndex: 1001,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: '18px' }}>{title}</h3>
        <p style={{ margin: '0 0 24px', color: '#555', lineHeight: 1.5 }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: '#f5f5f5',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Cargando...' : confirmText}
          </button>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
