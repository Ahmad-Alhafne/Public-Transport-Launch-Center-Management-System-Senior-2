import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { getAssignedAuditTrip, validateQr, recordScan } from '../../services/api';

export default function ActiveAudit() {
  const { t } = useTranslation();
  const [assigned, setAssigned] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getAssignedAuditTrip();
        setAssigned(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!assigned) return;
    const scannerId = `html5qr-reader`;
    const element = scannerRef.current;
    if (!element) return;

    const html5QrCode = new Html5Qrcode(scannerId);
    html5QrRef.current = html5QrCode;

    const config = { fps: 10, qrbox: 250 };

    // Play a short beep using WebAudio
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

    const startScanner = () => {
      html5QrRef.current
        .start({ facingMode: 'environment' }, config, handleDecode, (err) => {})
        .catch((err) => console.error('QR start failed', err));
    };

    const handleDecode = async (decodedText, decodedResult) => {
      if (!decodedText) return;

      // Play a capture beep immediately
      playBeep(1200, 100);

      // Stop scanner briefly to avoid duplicate reads
      try {
        await html5QrRef.current.stop();
      } catch {}

      try {
        const { data } = await validateQr(decodedText);
        const ui = {
          status: data.result,
          message: data.message,
          passengerName: data.passengerName,
          bookingId: data.bookingId,
          citizenId: data.citizenId,
          tripId: data.tripId
        };
        setResult(ui);

        if (data.bookingId && data.citizenId && data.tripId) {
          await recordScan({ bookingId: data.bookingId, citizenId: data.citizenId, tripId: data.tripId, result: data.result, notes: data.message });
        }
      } catch (e) {
        console.error(e);
        setResult({ status: 'Error', message: 'Validation failed' });
      }

      // Auto-clear result and restart scanner after short delay
      setTimeout(async () => {
        setResult(null);
        try {
          if (html5QrRef.current) {
            await html5QrRef.current.start({ facingMode: 'environment' }, config, handleDecode, (err) => {});
          }
        } catch (e) {
          console.error('Failed to restart scanner', e);
        }
      }, 2000);
    };

    // start initially
    startScanner();

    return () => {
      if (html5QrRef.current) {
        html5QrRef.current
          .stop()
          .then(() => html5QrRef.current.clear())
          .catch(() => {});
      }
    };
  }, [assigned]);

  if (loading) return (
    <div className="content-wrapper py-6">
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
      </div>
    </div>
  );

  if (!assigned) return (
    <div className="content-wrapper py-6">
      <div className="card p-4">
        <div className="text-sm text-[var(--charcoal-medium)]">{t('auditor.active.noAssignment', 'No active trip assigned')}</div>
      </div>
    </div>
  );

  return (
    <div className="content-wrapper py-6">
      <h2 className="heading-md">{t('auditor.active.title', 'Active Audit')}</h2>
      <div className="card p-4 mt-4">
        <div className="font-semibold">{assigned.routeName}</div>
        <div className="text-sm text-muted">{new Date(assigned.departureUtc).toLocaleString()}</div>
      </div>

      <div className="mt-6">
        <div className="card p-4 relative">
          <div className="mb-3">{t('auditor.active.scanner', 'Scanner')}</div>
          <div id={`html5qr-reader`} ref={scannerRef} style={{ width: '100%' }} />

          {result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
              <div className="text-xl font-semibold">{result.status}</div>
              {result.passengerName && <div className="mt-1">{result.passengerName}</div>}
              <div className="text-sm mt-2">{result.message}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
