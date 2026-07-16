import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LiveMap({ trackings = [], selectedTrip = null, emergencyTrips = {} }) {
  const { t } = useTranslation();
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

  const emergencyIcon = useMemo(() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"><path fill="#e53e3e" d="M12 2.75l9 15.59c.18.31.18.69 0 1A.74.74 0 0 1 20.25 20H3.75c-.33 0-.62-.18-.75-.46a.9.9 0 0 1 0-1L12 2.75zm0 10.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm.75-5.75h-1.5v5.5h1.5v-5.5z"/></svg>`;
    return L.icon({
      iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg),
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -12]
    });
  }, []);

  // Determine which trackings should be visible on the map (only started/active trips)
  const activeTrackings = trackings.filter(tracking => {
    const status = (tracking.status || tracking.tripStatus || tracking.state || '').toString().toLowerCase();
    if (status) return status === 'started' || status === 'inprogress' || status === 'active' || status === 'running';
    // fallback boolean flags
    if (tracking.isActive === true) return true;
    if (tracking.started === true) return true;
    return false;
  }).map(tracking => {
    // coerce numeric latitude/longitude for Leaflet and provide fallbacks
    const lat = Number(tracking.currentLatitude ?? tracking.latitude ?? tracking.CurrentLatitude ?? tracking.Latitude);
    const lng = Number(tracking.currentLongitude ?? tracking.longitude ?? tracking.CurrentLongitude ?? tracking.Longitude);
    return { ...tracking, _lat: Number.isFinite(lat) ? lat : null, _lng: Number.isFinite(lng) ? lng : null };
  }).filter(tracking => tracking._lat !== null && tracking._lng !== null);

  return (
    <div className="bg-white shadow rounded p-3" style={{ height: '75vh' }}>
      <MapContainer key={key} center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {activeTrackings.map(tracking => {
          const hasEmergency = emergencyTrips[tracking.tripId] === true;
          return (
            <Marker key={tracking.tripId} position={[tracking._lat, tracking._lng]} icon={hasEmergency ? emergencyIcon : busIcon}>
              <Popup>
                <div>
                  <div><strong>{tracking.tripNumber || tracking.tripId}</strong></div>
                  <div>{tracking.driverName || tracking.driverId}</div>
                  <div>{tracking.vehiclePlate || tracking.vehicleId}</div>
                  {hasEmergency && <div style={{ color: '#c53030', fontWeight: '600' }}>{t('components.liveMap.emergencyActive','Emergency reported')}</div>}
                  <div>{t('components.liveMap.reservedSeats','Reserved Seats')}: {tracking.reservedSeats ?? tracking.reserved_seats ?? tracking.reservedSeatsCount ?? '-'}</div>
                  <div>{t('components.liveMap.speed','Speed')}: {Number.isFinite(Number(tracking.currentSpeed)) ? `${Number(tracking.currentSpeed).toFixed(1)} ${t('components.activeTrips.kmh','km/h')}` : '-'}</div>
                  <div>{t('components.liveMap.updated','Updated')}: {tracking.lastUpdatedAt || '-'}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {selectedTrip && ((selectedTrip.status || selectedTrip.isActive) ? (
          (() => {
            const lat = Number(selectedTrip.currentLatitude ?? selectedTrip.latitude ?? selectedTrip.Latitude);
            const lng = Number(selectedTrip.currentLongitude ?? selectedTrip.longitude ?? selectedTrip.Longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            const hasEmergency = emergencyTrips[selectedTrip.tripId] === true;
            return (
              <Marker position={[lat, lng]} icon={hasEmergency ? emergencyIcon : busIcon}>
                <Popup>
                  <div><strong>{t('components.liveMap.selected','Selected')}: {selectedTrip.tripNumber || selectedTrip.tripId}</strong></div>
                  {hasEmergency && <div style={{ color: '#c53030', fontWeight: '600' }}>{t('components.liveMap.emergencyActive','Emergency reported')}</div>}
                </Popup>
              </Marker>
            );
          })()
        ) : null)}
      </MapContainer>
    </div>
  );
}
