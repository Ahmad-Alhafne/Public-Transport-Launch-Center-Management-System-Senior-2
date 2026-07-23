import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditHistory } from '../../services/api';

export default function AuditHistory() {
  const { t } = useTranslation();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTripId, setExpandedTripId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getAuditHistory();
        setHistory((data || []).slice(0, 5));
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
                  <th className="py-2">{t('common.time', 'Departure')}</th>
                  <th className="py-2">{t('auditor.history.scans', 'Scans')}</th>
                  <th className="py-2">{t('auditor.history.lastScan', 'Last scan')}</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {history.map((trip) => (
                  <React.Fragment key={trip.tripId}>
                    <tr className="border-t">
                      <td className="py-3 font-semibold text-[var(--charcoal)]">{trip.tripRoute}</td>
                      <td className="py-3 text-sm text-[var(--charcoal-medium)]">{trip.departureUtc ? new Date(trip.departureUtc).toLocaleString() : t('common.unknown', 'Unknown')}</td>
                      <td className="py-3 text-sm text-[var(--charcoal-medium)]">{trip.scanCount}</td>
                      <td className="py-3 text-sm text-[var(--charcoal-medium)]">{trip.lastScanTime ? new Date(trip.lastScanTime).toLocaleString() : '-'}</td>
                      <td className="py-3">
                        <button
                          className="button button-secondary text-sm"
                          onClick={() => setExpandedTripId(expandedTripId === trip.tripId ? null : trip.tripId)}
                        >
                          {expandedTripId === trip.tripId ? t('auditor.history.hideCitizens', 'Hide citizens') : t('auditor.history.viewCitizens', 'View citizens')}
                        </button>
                      </td>
                    </tr>
                    {expandedTripId === trip.tripId && (
                      <tr className="bg-slate-50">
                        <td colSpan="5" className="p-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-[var(--charcoal-medium)]">
                                  <th className="py-2">{t('auditor.history.citizenName', 'Citizen')}</th>
                                  <th className="py-2">{t('auditor.history.scanResult', 'Result')}</th>
                                  <th className="py-2">{t('auditor.history.scanTime', 'Scan time')}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {trip.records.map((record) => (
                                  <tr key={record.bookingId} className="border-t">
                                    <td className="py-3 text-sm text-[var(--charcoal-medium)]">{record.citizenName}</td>
                                    <td className="py-3 font-semibold">{record.status}</td>
                                    <td className="py-3 text-sm text-[var(--charcoal-medium)]">{new Date(record.scanTime).toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
