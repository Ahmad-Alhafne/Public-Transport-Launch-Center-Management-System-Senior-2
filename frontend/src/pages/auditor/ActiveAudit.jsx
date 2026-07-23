import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { getAssignedAuditTrips, getTripBookings, validateQr, recordScan } from '../../services/api';

const SCANNER_ID = 'html5qr-reader';

export default function ActiveAudit() {
  const { t } = useTranslation();
  const [assignedTrips, setAssignedTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanStatusesByTrip, setScanStatusesByTrip] = useState({});
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(true);
  const [completionMessage, setCompletionMessage] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const scanBusyRef = useRef(false);
  const autoResumeTimerRef = useRef(null);
  const completionTimerRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getAssignedAuditTrips();
        setAssignedTrips(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (raw) => {
    if (!raw) return '-';
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? t('common.invalidDate', 'Invalid date') : d.toLocaleString();
  };

  const handleSelectTrip = (trip) => {
    setSelectedTrip({ ...trip, passengers: trip.passengers || [] });
    setCompletionMessage(null);
    setScanResult(null);
    scanBusyRef.current = false;
    setScannerActive(true);

    if (trip.tripId) {
      loadTripPassengers(trip.tripId);
    }
  };

  const loadTripPassengers = async (tripId) => {
    try {
      const { data } = await getTripBookings(tripId);
      if (Array.isArray(data) && data.length) {
        setSelectedTrip((prev) => ({
          ...prev,
          passengers: data.map((booking) => ({
            bookingId: booking.id,
            citizenId: booking.passengerId,
            passengerName: booking.passengerName,
            bookingStatus: booking.status || 'Confirmed'
          }))
        }));
      }
    } catch (err) {
      console.warn('Unable to load trip passengers', err);
    }
  };

  const handleBackToTrips = async () => {
    await cleanupScanner();
    setSelectedTrip(null);
    setScanResult(null);
    setCompletionMessage(null);
    setScannerActive(true);
  };

  const handleCloseScanner = async () => {
    await cleanupScanner();
    setScanResult(null);
    setCompletionMessage(null);
    setScannerActive(false);
  };

  const cleanupScanner = async () => {
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }

    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }

    if (html5QrRef.current && scannerStartedRef.current) {
      try {
        await html5QrRef.current.stop();
      } catch {
        // ignore
      }
      scannerStartedRef.current = false;
    }

    if (html5QrRef.current) {
      try {
        await html5QrRef.current.clear();
      } catch {
        // ignore
      }
    }
  };

  const updateScanStatus = (tripId, bookingId, status) => {
    setScanStatusesByTrip((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        [bookingId]: status
      }
    }));
  };

  const checkIfAllPassengersScanned = (tripId, passengers, statuses) => {
    if (!passengers || passengers.length === 0) return false;
    const tripStatuses = statuses[tripId] || {};
    return passengers.every((p) => tripStatuses[p.bookingId] === 'success');
  };

  const getScanStatus = (bookingId) => {
    if (!selectedTrip) return null;
    return scanStatusesByTrip[selectedTrip.tripId]?.[bookingId] || null;
  };

  useEffect(() => {
    if (!selectedTrip || !scannerActive) return;

    const scannerId = SCANNER_ID;
    const element = scannerRef.current;
    if (!element) return;

    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrRef.current = html5QrCode;

    const config = { fps: 10, qrbox: 250 };

    const playBeep = (freq = 880, duration = 120) => {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        const ctx = new Ctx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.value = 0.08;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        setTimeout(() => { try { o.stop(); ctx.close(); } catch {} }, duration);
      } catch (e) {
        // ignore audio errors
      }
    };

    const handleDecode = async (decodedText) => {
      if (!decodedText) return;
      if (scanBusyRef.current) return;
      scanBusyRef.current = true;

      playBeep(1200, 100);

      try {
        const { data } = await validateQr(decodedText, selectedTrip?.tripId);
        const ui = {
          status: data.result,
          message: data.message,
          passengerName: data.passengerName,
          bookingId: data.bookingId,
          citizenId: data.citizenId,
          tripId: data.tripId
        };
        setScanResult(ui);

        if (data.bookingId) {
          const status = data.result === 'Approved' ? 'success' : 'fail';
          updateScanStatus(data.tripId, data.bookingId, status);
        }

        if (data.bookingId && data.citizenId && data.tripId) {
          await recordScan({ bookingId: data.bookingId, citizenId: data.citizenId, tripId: data.tripId, result: data.result, notes: data.message });
        }

        if (data.result === 'Approved') {
          autoResumeTimerRef.current = setTimeout(async () => {
            setScanResult(null);
            scanBusyRef.current = false;
            
            // Check if all passengers are now scanned successfully
            setScanStatusesByTrip((prevStatuses) => {
              const allScanned = checkIfAllPassengersScanned(data.tripId, selectedTrip.passengers, { ...prevStatuses, [data.tripId]: { ...prevStatuses[data.tripId], [data.bookingId]: 'success' } });
              if (allScanned) {
                setCompletionMessage(t('auditor.active.allScanned', 'All passengers scanned successfully! Trip will be moved to history.'));
                completionTimerRef.current = setTimeout(() => {
                  setAssignedTrips((prev) => prev.filter((t) => t.id !== selectedTrip.id));
                  setCompletionMessage(null);
                  setSelectedTrip(null);
                  setScanResult(null);
                }, 2500);
              }
              return prevStatuses;
            });
          }, 1800);
        } else {
          scanBusyRef.current = false;
        }
      } catch (e) {
        console.error(e);
        setScanResult({ status: t('auditor.active.statusError', 'Error'), message: t('auditor.active.validationFailed', 'Validation failed') });
        scanBusyRef.current = false;
      }
    };

    html5QrCode
      .start({ facingMode: 'environment' }, config, handleDecode, (err) => {})
      .then(() => {
        scannerStartedRef.current = true;
      })
      .catch((err) => console.error('QR start failed', err));

    return () => {
      cleanupScanner();
    };
  }, [selectedTrip, scannerActive, t]);

  const resumeScanner = () => {
    setScanResult(null);
    scanBusyRef.current = false;
    setScannerActive(true);
  };

  if (loading) return (
    <div className="content-wrapper py-6">
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
      </div>
    </div>
  );

  const activeTrips = assignedTrips.filter((trip) => trip.status !== 'Completed' && trip.status !== 'Cancelled');

  if (!selectedTrip) {
    return (
      <div className="content-wrapper py-6">
        <h2 className="heading-md">{t('auditor.active.title', 'Active Audit')}</h2>
        <div className="space-y-4 mt-4">
          {activeTrips.length === 0 ? (
            <div className="card p-4">
              <div className="text-sm text-[var(--charcoal-medium)]">{t('auditor.active.noAssignment', 'No active trip assigned')}</div>
            </div>
          ) : (
            <div className="card p-4">
              <div className="text-sm text-[var(--charcoal-medium)] mb-3">{t('auditor.active.pickTrip', 'Select one of your picked trips to start audit')}</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th className="pb-2">{t('auditor.active.route', 'Route')}</th>
                      <th className="pb-2">{t('auditor.active.departure', 'Departure')}</th>
                      <th className="pb-2">{t('auditor.active.status', 'Status')}</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrips.map((trip) => (
                      <tr key={trip.id} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="py-3">{trip.routeName}</td>
                        <td className="py-3">{formatDate(trip.departureUtc)}</td>
                        <td className="py-3">{trip.status}</td>
                        <td className="py-3">
                          <button className="button button-primary text-sm" onClick={() => handleSelectTrip(trip)}>{t('auditor.active.select', 'Select')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper py-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="heading-md">{t('auditor.active.title', 'Active Audit')}</h2>
          <div className="text-sm text-[var(--charcoal-medium)] mt-1">{selectedTrip.routeName}</div>
        </div>
        <button className="button button-secondary" onClick={handleBackToTrips}>{t('auditor.active.back', 'Back to trips')}</button>
      </div>

      <div className="card p-4 mt-4">
        <div className="font-semibold">{selectedTrip.routeName}</div>
        <div className="text-sm text-muted">{formatDate(selectedTrip.departureUtc)}</div>
      </div>

      <div className="grid gap-6 mt-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="font-semibold">{t('auditor.active.scanner', 'Scanner')}</div>
            <button className="button button-secondary text-sm" onClick={handleCloseScanner}>{t('auditor.active.closeScanner', 'Close scanner')}</button>
          </div>
          <div className="relative">
            <div id={SCANNER_ID} ref={scannerRef} style={{ width: '100%' }} />
            {!scannerActive && !scanResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-600">
                {t('auditor.active.scannerPaused', 'Scanner paused')}
              </div>
            )}
            {scanResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white p-4">
                <div className="text-xl font-semibold">{scanResult.status}</div>
                {scanResult.passengerName && <div className="mt-2">{scanResult.passengerName}</div>}
                <div className="text-sm mt-2 text-center">{scanResult.message}</div>
                <button className="button button-primary mt-4" onClick={resumeScanner}>{t('auditor.active.scanAnother', 'Scan another')}</button>
              </div>
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="font-semibold mb-3">{t('auditor.active.citizens', 'Trip citizens')}</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="pb-2">{t('auditor.active.citizenName', 'Name')}</th>
                  <th className="pb-2">{t('auditor.active.bookingStatus', 'Booking status')}</th>
                  <th className="pb-2">{t('auditor.active.scanStatus', 'Scan')}</th>
                </tr>
              </thead>
              <tbody>
                {selectedTrip.passengers?.length > 0 ? (
                  selectedTrip.passengers.map((passenger) => {
                    const status = getScanStatus(passenger.bookingId);
                    return (
                      <tr key={passenger.bookingId} className="border-t border-slate-200">
                        <td className="py-3">{passenger.passengerName}</td>
                        <td className="py-3">{passenger.bookingStatus}</td>
                        <td className="py-3">
                          {status === 'success' && <span className="text-emerald-600 font-semibold">✓ {t('auditor.active.success', 'Success')}</span>}
                          {status === 'fail' && <span className="text-red-600 font-semibold">✕ {t('auditor.active.failed', 'Failed')}</span>}
                          {!status && <span className="text-slate-500">{t('auditor.active.notScanned', 'Not scanned')}</span>}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="py-3 text-slate-600" colSpan="3">{t('auditor.active.noCitizens', 'No citizens found for this trip.')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {completionMessage && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-800">
              {completionMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
