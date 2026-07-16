import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditStats } from '../../services/api';

export default function AuditorDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getAuditStats();
        setStats(data);
      } catch {
        // ignore
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
      <h1 style={{margin:'20px 0'}} className="heading-lg text-[var(--charcoal)]">{t('auditor.dashboard.title', 'Auditor Dashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="card p-4">
          <div className="text-sm text-[var(--charcoal-medium)]">{t('auditor.dashboard.assignedTrips', 'Assigned Trips')}</div>
          <div className="font-bold text-2xl">{stats?.assignedTrips ?? '-'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-[var(--charcoal-medium)]">{t('auditor.dashboard.completedAudits', 'Completed Audits')}</div>
          <div className="font-bold text-2xl">{stats?.completedAudits ?? '-'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-[var(--charcoal-medium)]">{t('auditor.dashboard.totalScanned', 'Total Scanned')}</div>
          <div className="font-bold text-2xl">{stats?.totalScanned ?? '-'}</div>
        </div>
      </div>
    </div>
  );
}
