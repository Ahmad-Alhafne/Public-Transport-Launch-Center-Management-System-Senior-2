import { useState, useEffect, useCallback } from 'react';
import { updateTripStatus, getDriverTrips, getDriverTripHistory, getAdminContact, getScheduledReminder, createScheduledReminder, deleteScheduledReminder } from '../../services/api';
import useDriverTracking from '../../hooks/useDriverTracking';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const statusStyles = {
    Scheduled: 'text-[var(--info)] bg-[var(--info-light)] border-[var(--info-border)]',
    Started: 'text-[var(--success)] bg-[var(--success-light)] border-[var(--success-border)]',
    Delayed: 'text-[var(--warning)] bg-[var(--warning-dark)] border-[var(--warning-border)]',
    Finished: 'text-[var(--text-muted)] bg-[var(--background-subtle)] border-[var(--border-subtle)]',
    Cancelled: 'text-[var(--error)] bg-[var(--error-light)] border-[var(--error-border)]'
};

function TripCard({
    trip,
    showActions = true,
    delayTripId,
    delayMinutes,
    setDelayMinutes,
    delayReason,
    setDelayReason,
    adminPhone,
    setConfirmingStart,
    setConfirmingFinish,
    setConfirmingDelay,
    startDelay,
    setDelayTripId,
    reminders,
    reminderMinutes,
    setReminderMinutes,
    onReminderChange
}) {
    const { t } = useTranslation();

    return (
        <div className="bg-[var(--surface)] rounded-[var(--radius)] p-6 border border-[var(--border-subtle)] shadow-sm transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-[var(--charcoal)]">🚌 {trip.busNumber}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[trip.status] || ''}`}>
                            {t(`driver.trips.status_${trip.status}`, { defaultValue: trip.status })}
                        </span>
                    </div>

                    <p className="text-[var(--text-muted)] text-sm">
                        {t('generated.pages_driver_DriverTrips_jsx_49_fa2c3830')} : {new Date(trip.departureTime).toLocaleString()}
                    </p>

                    {trip.status === 'Delayed' && (
                        <p className="text-xs text-[var(--warning-dark)] font-medium bg-[var(--warning-light)] px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--warning-border)]">
                            {t('generated.pages_driver_DriverTrips_jsx_53_82c8e4b1')}: {trip.delayMinutes ?? t('common.na')} {t('generated.pages_driver_DriverTrips_jsx_53_9b5ebe51')}
                            {trip.delayReason && ` | ${t('generated.pages_driver_DriverTrips_jsx_54_aa37c611')}: ${trip.delayReason}`}
                            {trip.adminContact && ` | ${t('generated.pages_driver_DriverTrips_jsx_55_12b8d4d6')}: ${trip.adminContact}`}
                        </p>
                    )}

                    <p className="text-xs text-[var(--text-muted)] font-medium">
                        💺 {trip.availableSeats}/{trip.totalSeats} {t('common.seats')}
                    </p>
                </div>

                {showActions && (
                    <div className="flex gap-2 flex-wrap items-center">
                        <button
                            onClick={() => setConfirmingStart(trip.id)}
                            className="px-3 py-1.5 bg-[var(--forest)] hover:bg-[var(--forest-dark)] text-white rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all"
                        >
                            {t('generated.pages_driver_DriverTrips_jsx_67_8fcc8c9d')}
                        </button>

                        <button
                            onClick={() => startDelay(trip.id)}
                            className="px-3 py-1.5 bg-[var(--warning-light)] text-[var(--warning-dark)] border border-[var(--warning-border)] rounded-[var(--radius-sm)] text-xs font-semibold hover:bg-[var(--warning-border)] transition-all"
                        >
                            {t('generated.pages_driver_DriverTrips_jsx_76_f7d0a5a1')}
                        </button>

                        <button
                            onClick={() => setConfirmingFinish(trip.id)}
                            className="px-3 py-1.5 danger-button text-white rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all"
                        >
                            {t('generated.pages_driver_DriverTrips_jsx_86_3b38b4a2')}
                        </button>

                        <div className="flex items-center gap-2 border-l border-[var(--border-light)] pl-2 ml-1">
                            <select
                                value={reminderMinutes[trip.id] ?? 30}
                                onChange={(e) => setReminderMinutes({
                                    ...reminderMinutes,
                                    [trip.id]: parseInt(e.target.value, 10)
                                })}
                                className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--charcoal)] px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-[var(--forest)]"
                            >
                                <option value={30}>30 min</option>
                                <option value={45}>45 min</option>
                                <option value={60}>60 min</option>
                                <option value={120}>2 hours</option>
                                <option value={360}>6 hours</option>
                                <option value={1440}>24 hours</option>
                            </select>

                            <button
                                onClick={async () => {
                                    try {
                                        if (reminders[trip.id]) {
                                            await deleteScheduledReminder(trip.id);
                                            onReminderChange(trip.id, null);
                                        } else {
                                            const minutes = reminderMinutes[trip.id] ?? 30;
                                            const payload = {
                                                tripId: trip.id,
                                                tripNumber: trip.busNumber || trip.tripNumber || '',
                                                departureTimeUtc: new Date(trip.departureTime).toISOString(),
                                                vehicleInfo: trip.vehicle || '',
                                                routeInfo: trip.route || '',
                                                startLocation: trip.startLocation || '',
                                                destination: trip.destination || '',
                                                reminderMinutesBeforeDeparture: minutes
                                            };
                                            const res = await createScheduledReminder(payload);
                                            onReminderChange(trip.id, res.data);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                        alert('Failed to update reminder');
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all ${
                                    reminders[trip.id]
                                        ? 'bg-[var(--error)] hover:bg-[var(--error-dark)] text-white'
                                        : 'bg-[var(--info)] hover:bg-[var(--info-dark)] text-white'
                                }`}
                            >
                                {reminders[trip.id] ? '🔔 Cancel' : '🔕 Set'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {delayTripId === trip.id && (
                <div className="mt-4 p-4 bg-[var(--background-subtle)] rounded-[var(--radius)] border border-[var(--border-subtle)] space-y-3 animate-fadeIn">
                    <h4 className="text-sm font-bold text-[var(--charcoal)]">
                        {t('generated.pages_driver_DriverTrips_jsx_97_260d091a')}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Minutes</span>
                            <input
                                type="number"
                                min={1}
                                value={delayMinutes}
                                onChange={(e) => setDelayMinutes(parseInt(e.target.value || '0', 10))}
                                placeholder={t('generated.pages_driver_DriverTrips_jsx_107_519a10a7')}
                                className="input-field w-full text-sm"
                            />
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Recipient Contact</span>
                            <input
                                type="text"
                                value={adminPhone}
                                readOnly
                                className="input-field w-full text-sm bg-[var(--border-light)] text-[var(--text-muted)] cursor-not-allowed"
                            />
                        </label>
                    </div>

                    <label className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Delay Justification</span>
                        <textarea
                            value={delayReason}
                            onChange={(e) => setDelayReason(e.target.value)}
                            placeholder={t('generated.pages_driver_DriverTrips_jsx_122_6de95de0')}
                            className="input-field w-full text-sm h-20 resize-none"
                        />
                    </label>

                    <div className="flex gap-2 justify-end pt-1">
                        <button
                            onClick={() => setDelayTripId(null)}
                            className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--background-subtle)] border border-[var(--border-subtle)] text-[var(--charcoal)] rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={() => setConfirmingDelay(trip.id)}
                            className="px-4 py-2 bg-[var(--forest)] hover:bg-[var(--forest-dark)] text-white rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all"
                        >
                            {t('generated.pages_driver_DriverTrips_jsx_129_48f0eda3')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DriverTrips() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [activeTrips, setActiveTrips] = useState([]);
    const [historyTrips, setHistoryTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('active');

    const [delayTripId, setDelayTripId] = useState(null);
    const [delayMinutes, setDelayMinutes] = useState(15);
    const [delayReason, setDelayReason] = useState('');
    const [adminContact, setAdminContact] = useState('');

    const [reminders, setReminders] = useState({});
    const [reminderMinutes, setReminderMinutes] = useState({});

    const [confirmingStart, setConfirmingStart] = useState(null);
    const [confirmingFinish, setConfirmingFinish] = useState(null);
    const [confirmingDelay, setConfirmingDelay] = useState(null);

    const [filters, setFilters] = useState({
        busNumber: '',
        departureTime: '',
        availableSeats: ''
    });

    const adminPhone = adminContact?.match(/\+?\d[\d\s-]{7,}/)?.[0] || adminContact || '';

    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            const [activeResponse, historyResponse] = await Promise.all([
                getDriverTrips(user.id),
                getDriverTripHistory(user.id)
            ]);
            setActiveTrips(activeResponse.data || []);
            setHistoryTrips(historyResponse.data || []);
        } catch {
            setError(t('generated.pages_driver_DriverTrips_jsx_201_9f5add3c'));
        } finally {
            setLoading(false);
        }
    }, [user.id, t]);

    const fetchAdminInfo = async () => {
        try {
            const contact = await getAdminContact();
            setAdminContact(contact || '');
        } catch {}
    };

    useEffect(() => {
        fetchTrips();
        fetchAdminInfo();
    }, [fetchTrips]);

    const trackingController = useDriverTracking({ tripId: null, vehicleId: null, driverId: user.id });

    useEffect(() => {
        const loadReminders = async () => {
            const map = {};
            const mins = {};
            await Promise.all((activeTrips || []).map(async (trip) => {
                try {
                    const res = await getScheduledReminder(trip.id);
                    if (res?.data) {
                        map[trip.id] = res.data;
                        mins[trip.id] = res.data.reminderMinutesBeforeDeparture || 30;
                    }
                } catch {
                    // Ignore missing reminder targets cleanly
                }
            }));
            setReminders(map);
            setReminderMinutes(prev => ({ ...prev, ...mins }));
        };

        loadReminders();
    }, [activeTrips]);

    const handleReminderChange = (id, data) => {
        if (data) {
            setReminders(prev => ({ ...prev, [id]: data }));
            setReminderMinutes(prev => ({ ...prev, [id]: data.reminderMinutesBeforeDeparture || 30 }));
        } else {
            setReminders(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
            setReminderMinutes(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    const filterTripFn = (trip) => {
        const matchesBus = !filters.busNumber || trip.busNumber.toLowerCase().includes(filters.busNumber.toLowerCase());
        const matchesDeparture = !filters.departureTime || new Date(trip.departureTime).toLocaleDateString().includes(filters.departureTime);
        const matchesSeats = !filters.availableSeats || trip.availableSeats.toString().includes(filters.availableSeats);
        return matchesBus && matchesDeparture && matchesSeats;
    };

    const filteredActiveTrips = activeTrips
        .filter(t => t.status !== 'Finished' && t.status !== 'Cancelled')
        .filter(filterTripFn);

    const filteredHistoryTrips = historyTrips.filter(filterTripFn);

    const handleStatusChange = async (id, status, payload = {}) => {
        try {
            await updateTripStatus(id, { status, ...payload });
            setError('');
            setDelayTripId(null);
            fetchTrips();
            // start/stop tracking when trip status changes
            if (status === 1) { // Started
                const trip = activeTrips.find(t => t.id === id) || {};
                const vehicleId = trip.vehicle?.id || trip.vehicleId || null;
                await trackingController.start({ tripId: id, vehicleId, driverId: user.id });
            }
            if (status === 3 || status === 4) { // Finished or Cancelled
                await trackingController.stop();
            }
        } catch (err) {
            setError(err.response?.data?.Detailed || t('generated.pages_driver_DriverTrips_jsx_281_8a8c72d5'));
        }
    };

    const startDelay = (tripId) => {
        setDelayTripId(tripId);
        setDelayMinutes(15);
        setDelayReason('');
    };

    const submitDelay = (tripId) => {
        handleStatusChange(tripId, 2, {
            delayMinutes,
            delayReason,
            adminContact: adminPhone
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );
    }

        // Show location permission warning for drivers
        if (trackingController?.permission === 'denied') {
            return (
                <div className="max-w-5xl mx-auto px-4 py-6">
                    <div className="alert alert-warning mb-4">
                        <strong>Location permission required.</strong>
                        <div className="mt-2 text-sm">The browser blocked access to your location. To enable live tracking:
                            <ul className="list-disc ml-5 mt-2 text-sm">
                                <li>Click the lock icon in the address bar → Site settings → Location → Allow.</li>
                                <li>Ensure OS location services are enabled (Windows: Settings → Privacy → Location).</li>
                                <li>After allowing, reload this page and press <em>Retry Permission</em>.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => trackingController.start()} className="btn btn-primary">Retry Permission</button>
                        <button onClick={() => window.location.reload()} className="btn btn-outline">Reload Page</button>
                        <a href="chrome://settings/content/location" target="_blank" rel="noreferrer" className="btn btn-ghost">Open Chrome Location Settings</a>
                    </div>
                </div>
            );
        }

    const currentTrips = activeTab === 'active' ? filteredActiveTrips : filteredHistoryTrips;

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--charcoal)] mb-6" style={{margin:'10px 0'}}>
                {t('generated.pages_driver_DriverTrips_jsx_313_5b1dd694')}
            </h1>

            {error && (
                <div className="alert alert-error text-sm font-medium shadow-sm mb-6">
                    {error}
                </div>
            )}

            {/* TAB NAVIGATION */}
            <div className="flex gap-1 bg-[var(--background-subtle)] p-1 rounded-[var(--radius)] border border-[var(--border-subtle)] mb-6">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2.5 px-4 rounded-[var(--radius-sm)] font-semibold text-sm transition-all duration-200 ${
                        activeTab === 'active'
                            ? 'bg-[var(--forest)] text-white shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--charcoal)] hover:bg-[var(--surface)]'
                    }`}
                >
                    {t('generated.pages_driver_DriverTrips_jsx_356_97de71d9')} ({filteredActiveTrips.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2.5 px-4 rounded-[var(--radius-sm)] font-semibold text-sm transition-all duration-200 ${
                        activeTab === 'history'
                            ? 'bg-[var(--forest)] text-white shadow-sm'
                            : 'text-[var(--text-muted)] hover:text-[var(--charcoal)] hover:bg-[var(--surface)]'
                    }`}
                >
                    {t('generated.pages_driver_DriverTrips_jsx_395_c7ae02ad')} ({filteredHistoryTrips.length})
                </button>
            </div>

            {/* FILTERS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10" style={{margin:'10px 0'}}>
                <input
                    placeholder={t('generated.pages_driver_DriverTrips_jsx_326_259a1b2b')}
                    value={filters.busNumber}
                    onChange={(e) => setFilters({ ...filters, busNumber: e.target.value })}
                    className="input-field w-full text-sm"
                />

                <input
                    placeholder={t('generated.pages_driver_DriverTrips_jsx_333_c529f9ee')}
                    value={filters.departureTime}
                    onChange={(e) => setFilters({ ...filters, departureTime: e.target.value })}
                    className="input-field w-full text-sm"
                />

                <input
                    type="number"
                    placeholder={t('generated.pages_driver_DriverTrips_jsx_340_96ede198')}
                    value={filters.availableSeats}
                    onChange={(e) => setFilters({ ...filters, availableSeats: e.target.value })}
                    className="input-field w-full text-sm"
                />
            </div>

            {/* TRIPS LIST WITH EXTRA TOP MARGIN / SEPARATION */}
            <div className="grid gap-4 mt-4">
                {currentTrips.map(trip => (
                    <TripCard
                        key={trip.id}
                        trip={trip}
                        showActions={activeTab === 'active'}
                        delayTripId={delayTripId}
                        delayMinutes={delayMinutes}
                        setDelayMinutes={setDelayMinutes}
                        delayReason={delayReason}
                        setDelayReason={setDelayReason}
                        adminPhone={adminPhone}
                        setConfirmingStart={setConfirmingStart}
                        setConfirmingFinish={setConfirmingFinish}
                        setConfirmingDelay={setConfirmingDelay}
                        startDelay={startDelay}
                        setDelayTripId={setDelayTripId}
                        reminders={reminders}
                        reminderMinutes={reminderMinutes}
                        setReminderMinutes={setReminderMinutes}
                        onReminderChange={handleReminderChange}
                    />
                ))}

                {currentTrips.length === 0 && (
                    <div className="text-center bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[var(--radius)] py-14 shadow-inner">
                        <p className="text-[var(--text-muted)] font-medium">
                            {t('generated.pages_citizen_MyBookings_jsx_185_0b1fa2a4')}
                        </p>
                    </div>
                )}
            </div>

            {/* CONFIRMATION MODALS */}
            <ConfirmationModal
                open={!!confirmingStart}
                title={t('generated.pages_driver_DriverTrips_jsx_403_6ddcfcd9')}
                message={t('driver.trips.confirmStartMessage')}
                confirmText={t('driver.trips.start')}
                cancelText={t('common.cancel')}
                onConfirm={() => {
                    handleStatusChange(confirmingStart, 1);
                    setConfirmingStart(null);
                }}
                onCancel={() => setConfirmingStart(null)}
            />

            <ConfirmationModal
                open={!!confirmingFinish}
                title={t('generated.pages_driver_DriverTrips_jsx_416_85caa587')}
                message={t('driver.trips.confirmFinishMessage')}
                confirmText={t('driver.trips.finish')}
                cancelText={t('common.cancel')}
                danger
                onConfirm={() => {
                    handleStatusChange(confirmingFinish, 3);
                    setConfirmingFinish(null);
                }}
                onCancel={() => setConfirmingFinish(null)}
            />

            <ConfirmationModal
                open={!!confirmingDelay}
                title={t('generated.pages_driver_DriverTrips_jsx_430_f2f971bb')}
                message={t('driver.trips.confirmDelayMessage')}
                confirmText={t('driver.trips.submit')}
                cancelText={t('common.cancel')}
                onConfirm={() => {
                    submitDelay(confirmingDelay);
                    setConfirmingDelay(null);
                }}
                onCancel={() => setConfirmingDelay(null)}
            />
        </div>
    );
}