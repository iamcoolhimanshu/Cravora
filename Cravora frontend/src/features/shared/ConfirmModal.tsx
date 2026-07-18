
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 11000 }}>
      <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.8rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm} style={{ flex: 1, background: '#ff3860' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
