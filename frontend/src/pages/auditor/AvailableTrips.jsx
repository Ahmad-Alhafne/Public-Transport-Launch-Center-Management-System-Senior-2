import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableAuditTrips, pickAuditTrip } from '../../services/api';

export default function AvailableTrips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const { data } = await getAvailableAuditTrips();
      setTrips(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handlePick = async (tripId) => {
    try {
      await pickAuditTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      alert(t('auditor.available.picked', 'Trip assigned to you'));
    } catch (e) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 409) {
        alert(t('auditor.available.alreadyAssigned', 'Trip already assigned'));
        // Refresh list to reflect current state
        await loadTrips();
        return;
      }
      alert(t('auditor.available.error', 'Unable to pick trip'));
    }
  };

  if (loading) return (
    <div className="content-wrapper py-6">
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
      </div>
    </div>
  );

  return (
    <div className="content-wrapper py-6">
      <h2 className="heading-md text-[var(--charcoal)]">{t('auditor.available.title', 'Available Trips')}</h2>
      <div className="card p-4 mt-4">
        {trips.length === 0 ? (
          <div className="text-sm text-[var(--charcoal-medium)]">{t('auditor.available.none', 'No trips available')}</div>
        ) : (
          <div className="table-shell">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--charcoal-medium)]">
                  <th className="py-2">{t('common.route', 'Route')}</th>
                  <th className="py-2">{t('common.departure', 'Departure')}</th>
                  <th className="py-2">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id} className="border-t">
                    <td className="py-3 font-semibold text-[var(--charcoal)]">{trip.routeName} {trip.id}</td>
                    <td className="py-3 text-sm text-[var(--charcoal-medium)]">{new Date(trip.departureUtc).toLocaleString()}</td>
                    <td className="py-3">
                      <button className="primary-button" onClick={() => handlePick(trip.id)}>{t('auditor.available.pick', 'Pick')}</button>
                    </td>
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
