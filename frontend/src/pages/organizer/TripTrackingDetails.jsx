import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import LiveMap from '../../components/LiveMap';
import { getTrackingHistory, getActiveTrackings } from '../../services/api';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';

export default function TripTrackingDetails() {
  const { t } = useTranslation();
  const { tripId } = useParams();
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTrackingHistory(tripId, 500);
        setHistory(res.data || []);
      } catch (e) {
        console.error('Failed to load history', e);
      }

      try {
        const active = await getActiveTrackings();
        const cur = (active.data || []).find(t => t.tripId === tripId);
        setCurrent(cur || null);
      } catch {}
    };
    load();
  }, [tripId]);

  const polyline = history.map(h => [h.latitude, h.longitude]);

  return (
    <div className="p-4">
      <h2 style={{margin:'20px 0'}} className="text-xl font-bold mb-4">{t('organizer.tripDetails.title', 'Trip Tracking Details')}</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">{t('organizer.tripDetails.info','Trip Info')}</h3>
          <p><strong>{t('organizer.tripDetails.trip','Trip')}:</strong> {tripId}</p>
          <p><strong>{t('organizer.tripDetails.driver','Driver')}:</strong> {current?.driverName || current?.driverId || '-'}</p>
          <p><strong>{t('organizer.tripDetails.vehicle','Vehicle')}:</strong> {current?.vehiclePlate || current?.vehicleId || '-'}</p>
          <p><strong>{t('organizer.tripDetails.speed','Speed')}:</strong> {current?.currentSpeed ?? '-'}</p>
          <p><strong>{t('organizer.tripDetails.coordinates','Coordinates')}:</strong> {current ? `${current.currentLatitude}, ${current.currentLongitude}` : '-'}</p>
          <p><strong>{t('organizer.tripDetails.lastUpdate','Last Update')}:</strong> {current?.lastUpdatedAt || '-'}</p>
        </div>

        <div className="col-span-2 bg-white p-4 rounded shadow" style={{ height: '70vh' }}>
          <MapContainer center={polyline.length ? polyline[polyline.length-1] : [31.9454,35.9284]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {polyline.length > 0 && (
              <Polyline positions={polyline} color="blue" />
            )}
            {current && (
              <Marker position={[current.currentLatitude || 0, current.currentLongitude || 0]} />
            )}
          </MapContainer>
        </div>
      </div>

      <div className="mt-4 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">{t('organizer.tripDetails.timeline','Tracking Timeline')}</h3>
        <div className="overflow-auto" style={{ maxHeight: 300 }}>
          <table className="w-full text-sm">
            <thead>
              <tr><th>{t('organizer.tripDetails.col.time','Time')}</th><th>{t('organizer.tripDetails.col.latitude','Latitude')}</th><th>{t('organizer.tripDetails.col.longitude','Longitude')}</th><th>{t('organizer.tripDetails.col.speed','Speed')}</th></tr>
            </thead>
            <tbody>
              {(history || []).map(h => (
                <tr key={h.id} className="border-t">
                  <td>{new Date(h.timestamp).toLocaleString()}</td>
                  <td>{h.latitude}</td>
                  <td>{h.longitude}</td>
                  <td>{h.speed ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
