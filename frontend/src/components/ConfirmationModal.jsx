import { useEffect } from 'react';

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  danger,
}) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onCancel?.();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <div className="w-full max-w-2xl rounded-[1.25rem] bg-white p-8 md:p-10 shadow-card border border-surface-muted"  style={{padding:'20px'}}>
      <div className="mb-6">
        <h2 className="text-3xl font-semibold text-charcoal">
          {title}
        </h2>
        <p className="mt-3 text-muted">
          {message}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="outline-button w-full sm:w-auto py-3 px-6 font-semibold"
          onClick={onCancel}
        >
          {cancelText}
        </button>

        <button
          type="button"
          className={`${
            danger ? 'danger-button' : 'primary-button'
          } w-full sm:w-auto py-3 px-6 font-semibold`}
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);
}