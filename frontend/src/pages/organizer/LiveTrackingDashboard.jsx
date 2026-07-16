import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import LiveMap from '../../components/LiveMap';
import ActiveTripsTable from '../../components/ActiveTripsTable';
import { getActiveTrackings, getTripEmergencies } from '../../services/api';
import { createLiveTrackingConnection, getConnection } from '../../services/signalr';

export default function LiveTrackingDashboard() {
  const { t } = useTranslation();
  const [trackings, setTrackings] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [filters, setFilters] = useState({ tripNumber: '', driverName: '', vehiclePlate: '', route: '', status: '' });
  const [tripEmergencies, setTripEmergencies] = useState({});

  useEffect(() => {
    let conn = null;
    let pollHandle = null;

    const load = async () => {
      try {
        const res = await getActiveTrackings();
        const rows = (res.data || []).map(normalizeTracking);
        console.debug('Loaded active trackings from API', rows);
        setTrackings(rows);
      } catch (e) {
        console.error('Failed to load active trackings', e);
      }

      const token = localStorage.getItem('token');
      conn = createLiveTrackingConnection(() => token);

      conn.on('ReceiveLocationUpdate', (rawDto) => {
        console.debug('SignalR ReceiveLocationUpdate raw', rawDto);
        const dto = normalizeTracking(rawDto);
        console.debug('SignalR ReceiveLocationUpdate normalized', dto);
        const finished = isFinishedStatus(dto.status);
        setTrackings((prev) => {
          if (finished) {
            return prev.filter(p => p.tripId !== dto.tripId);
          }
          const idx = prev.findIndex(p => p.tripId === dto.tripId);
          if (idx === -1) return [...prev, dto];
          const copy = [...prev];
          copy[idx] = { ...copy[idx], currentLatitude: dto.currentLatitude ?? dto.latitude, currentLongitude: dto.currentLongitude ?? dto.longitude, currentSpeed: dto.currentSpeed ?? dto.speed, lastUpdatedAt: dto.lastUpdatedAt ?? dto.timestamp };
          return copy;
        });
      });

      conn.start().catch(err => console.error('SignalR start error', err));

      // Poll active trackings periodically to ensure finished trips are removed
      pollHandle = setInterval(async () => {
        try {
          const res = await getActiveTrackings();
          const rows = (res.data || []).map(normalizeTracking);
          setTrackings(rows);
        } catch (err) {
          console.debug('Polling active trackings failed', err);
        }
      }, 5000);
    };

    load();

    return () => {
      const c = getConnection();
      if (c) c.stop();
      if (pollHandle) clearInterval(pollHandle);
    };
  }, []);

  // Helper: normalize server/SignalR DTOs (PascalCase or camelCase) into camelCase keys used in UI
  function normalizeTracking(o) {
    if (!o) return o;
    return {
      tripId: o.tripId || o.TripId || o.TripID || null,
      tripNumber: o.tripNumber || o.TripNumber || o.TripNo || o.tripNo || null,
      driverId: o.driverId || o.DriverId || o.DriverID || null,
      driverName: o.driverName || o.DriverName || o.FullName || o.fullName || null,
      vehicleId: o.vehicleId || o.VehicleId || null,
      vehiclePlate: o.vehiclePlate || o.VehiclePlate || o.plate || null,
      reservedSeats: o.reservedSeats ?? o.ReservedSeats ?? o.reserved_seats ?? o.Reserved_Seats ?? null,
      currentLatitude: o.currentLatitude ?? o.CurrentLatitude ?? o.latitude ?? o.Latitude ?? null,
      currentLongitude: o.currentLongitude ?? o.CurrentLongitude ?? o.longitude ?? o.Longitude ?? null,
      currentSpeed: o.currentSpeed ?? o.CurrentSpeed ?? o.speed ?? o.Speed ?? null,
      lastUpdatedAt: o.lastUpdatedAt || o.LastUpdatedAt || o.timestamp || o.Timestamp || null,
      status: (o.status || o.Status || o.trackingStatus || o.TrackingStatus || o.state || o.State || o.isActive) ?? null,
      emergencyActive: o.emergencyActive ?? o.hasEmergency ?? false,
      __raw: o
    };
  }

  async function loadEmergenciesForTrips(tripIds) {
    if (!tripIds?.length) return;
    const results = await Promise.all(tripIds.map(async (tripId) => {
      if (!tripId) return [tripId, false];
      try {
        const res = await getTripEmergencies(tripId);
        const emergencies = Array.isArray(res.data) ? res.data : [];
        const hasOpenEmergency = emergencies.some(e => (e.status || '').toString().toLowerCase() === 'reported');
        return [tripId, hasOpenEmergency];
      } catch (err) {
        console.error('Failed to load emergencies for trip', tripId, err);
        return [tripId, false];
      }
    }));

    setTripEmergencies(prev => {
      const next = { ...prev };
      for (const item of results) {
        if (item && item[0]) next[item[0]] = item[1];
      }
      return next;
    });
  }

  useEffect(() => {
    if (!trackings.length) return;

    const tripIds = Array.from(new Set(trackings.map(t => t.tripId).filter(Boolean)));
    loadEmergenciesForTrips(tripIds);
    const interval = setInterval(() => loadEmergenciesForTrips(tripIds), 15000);
    return () => clearInterval(interval);
  }, [trackings]);

  const applyFilters = (list) => {
    return list.filter(t => {
      const { tripNumber, driverName, vehiclePlate, route, status } = filters;
      if (tripNumber && !(t.tripNumber || '').toString().toLowerCase().includes(tripNumber.toLowerCase())) return false;
      if (driverName && !(t.driverName || '').toLowerCase().includes(driverName.toLowerCase())) return false;
      if (vehiclePlate && !(t.vehiclePlate || '').toLowerCase().includes(vehiclePlate.toLowerCase())) return false;
      if (route && !(t.route || '').toLowerCase().includes(route.toLowerCase())) return false;
      if (status && !(t.status || '').toString().toLowerCase().includes(status.toLowerCase())) return false;
      return true;
    });
  };

  function isFinishedStatus(s) {
    if (s == null) return false;
    const st = (s || '').toString().toLowerCase();
    return ['finished', 'stopped', 'completed', 'inactive', 'cancelled', 'cancelledbydriver'].includes(st);
  }

  const filtered = applyFilters(trackings || []);

  return (
    <div className="p-4">
      <h2 style={{margin:'20px 0'}} className="text-xl font-bold mb-4">{t('organizer.live.title', 'Live Tracking Dashboard')}</h2>
      <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-2">
        <input placeholder={t('organizer.live.filter.tripNumber', 'Trip number')} value={filters.tripNumber} onChange={e=>setFilters({...filters,tripNumber:e.target.value})} className="input-field" />
        <input placeholder={t('organizer.live.filter.driverName', 'Driver name')} value={filters.driverName} onChange={e=>setFilters({...filters,driverName:e.target.value})} className="input-field" />
        <input placeholder={t('organizer.live.filter.vehiclePlate', 'Vehicle plate')} value={filters.vehiclePlate} onChange={e=>setFilters({...filters,vehiclePlate:e.target.value})} className="input-field" />
        <input placeholder={t('organizer.live.filter.route', 'Route')} value={filters.route} onChange={e=>setFilters({...filters,route:e.target.value})} className="input-field" />
        <select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})} className="input-field">
          <option value="">{t('organizer.live.filter.all', 'All')}</option>
          <option value="Active">{t('organizer.live.filter.active', 'Active')}</option>
          <option value="Inactive">{t('organizer.live.filter.inactive', 'Inactive')}</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <ActiveTripsTable trackings={filtered} emergencyTrips={tripEmergencies} onSelect={(t) => setSelectedTrip(t)} />
        </div>
        <div className="col-span-2">
          <LiveMap trackings={filtered} selectedTrip={selectedTrip} emergencyTrips={tripEmergencies} />
        </div>
      </div>
    </div>
  );
}
