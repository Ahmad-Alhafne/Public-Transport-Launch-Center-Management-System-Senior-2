import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditHistory } from '../../services/api';

export default function AuditHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getAuditHistory();
        setHistory(data || []);
      } catch (e) {
        console.error(e);
      }
      finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  if (loading) return (
    <div className="content-wrapper py-6">
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
      </div>
    </div>
  );

  return (
    <div className="content-wrapper py-6">
      <h2 className="heading-md text-[var(--charcoal)]">{t('auditor.history.title', 'Audit History')}</h2>
      <div className="card p-4 mt-4">
        {history.length === 0 ? (
          <div className="text-sm text-[var(--charcoal-medium)]">{t('auditor.history.empty', 'No audit history found.')}</div>
        ) : (
          <div className="table-shell">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--charcoal-medium)]">
                  <th className="py-2">{t('common.route', 'Route')}</th>
                  <th className="py-2">{t('common.time', 'Time')}</th>
                  <th className="py-2">{t('common.result', 'Result')}</th>
                  <th className="py-2">{t('common.citizen', 'Citizen')}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="py-3 font-semibold text-[var(--charcoal)]">{h.tripRoute}</td>
                    <td className="py-3 text-sm text-[var(--charcoal-medium)]">{new Date(h.scanTime).toLocaleString()}</td>
                    <td className="py-3 font-semibold">{h.result}</td>
                    <td className="py-3 text-sm text-[var(--charcoal-medium)]">{h.citizenName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
