import { useEffect, useState } from 'react';
import { getMyComplaints, createComplaint } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function OrganizerComplaints() {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await getMyComplaints();
      setComplaints(data || []);
    };
    fetch();
  }, []);

  return (
    <div className="content-wrapper py-6">
      <h1 className="text-2xl font-bold mb-4">{t('organizer.complaints.title', 'My Complaints')}</h1>
      <div className="card p-4">
        {complaints.length === 0 ? <div>{t('organizer.complaints.empty', 'No complaints yet')}</div> : (
          <ul>
            {complaints.map(c => (<li key={c.id}>{c.description} — {c.status}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}
