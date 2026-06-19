import { useEffect, useRef, useState } from 'react';
import { updateDriverLocation, startDriverTracking, stopDriverTracking } from '../services/api';

export default function useDriverTracking({ tripId, vehicleId, driverId, intervalMs = 7000 } = {}) {
  const watchRef = useRef(null);
  const tripIdRef = useRef(tripId ?? null);
  const vehicleIdRef = useRef(vehicleId ?? null);
  const driverIdRef = useRef(driverId ?? null);
  const [permission, setPermission] = useState('prompt');
  const [tracking, setTracking] = useState(false);

  const sendPosition = async (pos) => {
    const dto = {
      tripId: tripIdRef.current,
      driverId: driverIdRef.current,
      vehicleId: vehicleIdRef.current,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      speed: pos.coords.speed ?? null,
      timestamp: new Date().toISOString()
    };
    try {
      await updateDriverLocation(dto);
    } catch (e) {
      console.error('Failed to send location', e);
    }
  };

  // Query the Permissions API to get current geolocation permission state
  const checkPermission = async () => {
    try {
      if (!('permissions' in navigator)) return setPermission('prompt');
      const status = await navigator.permissions.query({ name: 'geolocation' });
      setPermission(status.state);
      status.onchange = () => setPermission(status.state);
    } catch (e) {
      // Not all browsers support the Permissions API
      console.warn('Permissions API unavailable', e);
      setPermission('prompt');
    }
  };

  // start accepts optional overrides: { tripId, vehicleId, driverId }
  const start = async (overrides = {}) => {
    if (overrides.tripId) tripIdRef.current = overrides.tripId;
    if (overrides.vehicleId) vehicleIdRef.current = overrides.vehicleId;
    if (overrides.driverId) driverIdRef.current = overrides.driverId;

    if (!('geolocation' in navigator)) return setPermission('unsupported');

    await checkPermission();

    // If permission is denied we surface that to the caller and avoid prompting again
    if (permission === 'denied') {
      console.warn('Geolocation permission is denied - instruct user to enable it in browser/site settings');
      return;
    }

    try {
      // Use watchPosition for more reliable continuous updates (avoids setInterval issues)
      watchRef.current = navigator.geolocation.watchPosition(async (pos) => {
        setPermission('granted');
        setTracking(true);
        await sendPosition(pos);
      }, (err) => {
        console.warn('geolocation error', err);
        if (err && err.code === 1) {
          // PERMISSION_DENIED
          setPermission('denied');
        }
      }, { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 });
    } catch (e) {
      console.error('start tracking failed', e);
    }
  };

  const stop = async () => {
    if (watchRef.current != null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setTracking(false);
    try {
      await stopDriverTracking({ tripId: tripIdRef.current, driverId: driverIdRef.current, vehicleId: vehicleIdRef.current });
    } catch (e) {
      console.warn('Failed to notify server stop', e);
    }
  };

  useEffect(() => {
    checkPermission();
    return () => {
      if (watchRef.current != null && 'geolocation' in navigator) navigator.geolocation.clearWatch(watchRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { permission, tracking, start, stop, setPermission, checkPermission };
}
