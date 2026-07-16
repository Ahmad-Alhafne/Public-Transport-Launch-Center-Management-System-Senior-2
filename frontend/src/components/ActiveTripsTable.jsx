import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ActiveTripsTable({ trackings = [], emergencyTrips = {}, onSelect = () => {} }) {
  const { t } = useTranslation();
  const activeTrackings = trackings.filter(tracking => {
    const status = (tracking.status || tracking.tripStatus || tracking.state || '').toString().toLowerCase();
    if (status) return status === 'started' || status === 'inprogress' || status === 'active' || status === 'running';
    if (tracking.isActive === true) return true;
    if (tracking.started === true) return true;
    return false;
  });

  return (
    <div className="bg-white shadow rounded p-3">
      <h3 className="font-semibold mb-2">{t('components.activeTrips.title', 'Active Trips')}</h3>
      <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>{t('components.activeTrips.col.driverName','Driver Name')}</th>
              <th>{t('components.activeTrips.col.tripNumber','Trip Number')}</th>
              <th>{t('components.activeTrips.col.speed','Speed')}</th>
              <th>{t('components.activeTrips.col.reservedSeats','Reserved Seats')}</th>
              <th>{t('components.activeTrips.col.emergency','Emergency')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activeTrackings.map(tracking => {
              const hasEmergency = emergencyTrips[tracking.tripId] === true;
              return (
                <tr key={tracking.tripId} className="border-t">
                  <td>{tracking.driverName || tracking.driverId}</td>
                  <td>{tracking.tripNumber || tracking.tripId}</td>
                  <td>{Number.isFinite(Number(tracking.currentSpeed)) ? `${Number(tracking.currentSpeed).toFixed(1)} ${t('components.activeTrips.kmh','km/h')}` : '-'}</td>
                  <td>{tracking.reservedSeats ?? tracking.reserved_seats ?? tracking.reservedSeatsCount ?? '-'}</td>
                  <td>{hasEmergency ? <span className="text-red-600 font-semibold">{t('components.activeTrips.emergency','Yes')}</span> : <span className="text-slate-500">{t('components.activeTrips.noEmergency','No')}</span>}</td>
                  <td><button className="text-blue-600" onClick={() => onSelect(tracking)}>{t('components.activeTrips.track','Track')}</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
