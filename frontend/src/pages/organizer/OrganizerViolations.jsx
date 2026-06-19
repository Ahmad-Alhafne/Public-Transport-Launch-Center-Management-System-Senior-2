import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function OrganizerViolations() {
  const { t } = useTranslation();
  const [violations, setViolations] = useState([]);

  useEffect(() => {
    // placeholder: fetch organizer's submitted violation reports
    setViolations([]);
  }, []);

  return (
    <div className="content-wrapper py-6">
      <h1 className="text-2xl font-bold mb-4">{t('organizer.violations.title', 'My Violations')}</h1>
      <div className="card p-4">
        {violations.length === 0 ? <div>{t('organizer.violations.empty', 'No violation reports')}</div> : (
          <ul>
            {violations.map(v => (<li key={v.id}>{v.description} — {v.status}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}
