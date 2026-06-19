import React from 'react';

export default function ActiveTripsTable({ trackings = [], onSelect = () => {} }) {
  const activeTrackings = trackings.filter(t => {
    const status = (t.status || t.tripStatus || t.state || '').toString().toLowerCase();
    if (status) return status === 'started' || status === 'inprogress' || status === 'active' || status === 'running';
    if (t.isActive === true) return true;
    if (t.started === true) return true;
    return false;
  });

  return (
    <div className="bg-white shadow rounded p-3">
      <h3 className="font-semibold mb-2">Active Trips</h3>
      <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Trip Number</th>
              <th>Speed</th>
              <th>Reserved Seats</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {activeTrackings.map(t => (
              <tr key={t.tripId} className="border-t">
                <td>{t.driverName || t.driverId}</td>
                <td>{t.tripNumber || t.tripId}</td>
                <td>{Number.isFinite(Number(t.currentSpeed)) ? `${Number(t.currentSpeed).toFixed(1)} km/h` : '-'}</td>
                <td>{t.reservedSeats ?? t.reserved_seats ?? t.reservedSeatsCount ?? '-'}</td>
                <td><button className="text-blue-600" onClick={() => onSelect(t)}>Track</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
