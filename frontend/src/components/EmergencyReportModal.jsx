import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function EmergencyReportModal({
  open,
  title,
  tripLabel,
  type,
  priority,
  description,
  error,
  onChange,
  onSubmit,
  onClose,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
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
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div style={{padding:'20px'}} className="w-full max-w-lg rounded-[1.25rem] bg-white p-6 shadow-2xl border border-[var(--border-subtle)]">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[var(--charcoal)]">{t('emergency.modal.title', { defaultValue: title || 'Report an Emergency' })}</h2>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm text-[var(--charcoal)]">
            <span>{t('emergency.modal.type','Emergency Type')}</span>
            <select
              value={type}
              onChange={(e) => onChange('type', e.target.value)}
              className="input-field"
            >
              <option value="Medical">{t('emergency.type.Medical','Medical')}</option>
              <option value="Security">{t('emergency.type.Security','Security')}</option>
              <option value="Mechanical">{t('emergency.type.Mechanical','Mechanical')}</option>
              <option value="Fire">{t('emergency.type.Fire','Fire')}</option>
              <option value="Other">{t('emergency.type.Other','Other')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-[var(--charcoal)]">
            <span>{t('emergency.modal.priority','Priority')}</span>
            <select
              value={priority}
              onChange={(e) => onChange('priority', e.target.value)}
              className="input-field"
            >
              <option value="Low">{t('emergency.priority.Low','Low')}</option>
              <option value="Medium">{t('emergency.priority.Medium','Medium')}</option>
              <option value="High">{t('emergency.priority.High','High')}</option>
              <option value="Critical">{t('emergency.priority.Critical','Critical')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-[var(--charcoal)]">
            <span>{t('emergency.modal.description','Description')}</span>
            <textarea
              style={{marginBottom:'10px',}}
              value={description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={5}
              className="input-field resize-none"
              placeholder={t('emergency.modal.descriptionPlaceholder','Describe the emergency in as much detail as possible.')}
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="outline-button w-full sm:w-auto py-3 px-5 font-semibold"
            onClick={onClose}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="primary-button w-full sm:w-auto py-3 px-5 font-semibold"
            onClick={onSubmit}
            style={{padding:'5px'}}
          >
            {t('emergency.modal.submit','Submit Report')}
          </button>
        </div>
      </div>
    </div>
  );
}
