import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ trackings = [], selectedTrip = null }) {
  const center = trackings.length ? [trackings[0].currentLatitude || 0, trackings[0].currentLongitude || 0] : [31.9454, 35.9284];

  const key = selectedTrip ? `${selectedTrip.tripId}-${selectedTrip.currentLatitude}-${selectedTrip.currentLongitude}` : `${center[0]}-${center[1]}`;

  const busIcon = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="#2b6cb0" d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1a2 2 0 0 1-2-2V6zm3 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>`;
    return L.icon({
      iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg),
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -12]
    });
  }, []);

  // Determine which trackings should be visible on the map (only started/active trips)
  const activeTrackings = trackings.filter(t => {
    const status = (t.status || t.tripStatus || t.state || '').toString().toLowerCase();
    if (status) return status === 'started' || status === 'inprogress' || status === 'active' || status === 'running';
    // fallback boolean flags
    if (t.isActive === true) return true;
    if (t.started === true) return true;
    return false;
  }).map(t => {
    // coerce numeric latitude/longitude for Leaflet and provide fallbacks
    const lat = Number(t.currentLatitude ?? t.latitude ?? t.CurrentLatitude ?? t.Latitude);
    const lng = Number(t.currentLongitude ?? t.longitude ?? t.CurrentLongitude ?? t.Longitude);
    return { ...t, _lat: Number.isFinite(lat) ? lat : null, _lng: Number.isFinite(lng) ? lng : null };
  }).filter(t => t._lat !== null && t._lng !== null);

  return (
    <div className="bg-white shadow rounded p-3" style={{ height: '75vh' }}>
      <MapContainer key={key} center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {activeTrackings.map(t => (
          <Marker key={t.tripId} position={[t._lat, t._lng]} icon={busIcon}>
            <Popup>
              <div>
                <div><strong>{t.tripNumber || t.tripId}</strong></div>
                <div>{t.driverName || t.driverId}</div>
                <div>{t.vehiclePlate || t.vehicleId}</div>
                <div>Reserved Seats: {t.reservedSeats ?? t.reserved_seats ?? t.reservedSeatsCount ?? '-'}</div>
                <div>Speed: {Number.isFinite(Number(t.currentSpeed)) ? `${Number(t.currentSpeed).toFixed(1)} km/h` : '-'}</div>
                <div>Updated: {t.lastUpdatedAt || '-'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
        {selectedTrip && ((selectedTrip.status || selectedTrip.isActive) ? (
          (() => {
            const lat = Number(selectedTrip.currentLatitude ?? selectedTrip.latitude ?? selectedTrip.Latitude);
            const lng = Number(selectedTrip.currentLongitude ?? selectedTrip.longitude ?? selectedTrip.Longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return (
              <Marker position={[lat, lng]} icon={busIcon}>
                <Popup><div><strong>Selected: {selectedTrip.tripNumber || selectedTrip.tripId}</strong></div></Popup>
              </Marker>
            );
          })()
        ) : null)}
      </MapContainer>
    </div>
  );
}
