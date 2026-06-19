import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getRoutes, getTripsByRoute, createBooking, addToFavorites, removeFromFavorites, getMyFavorites, getScheduledReminder, createScheduledReminder, deleteScheduledReminder, getMyActiveBookings } from '../../services/api';
import QRCode from 'react-qr-code';

export default function CitizenTrips() {
    const { t } = useTranslation();
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [trips, setTrips] = useState([]);
    const [loadingRoutes, setLoadingRoutes] = useState(true);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [bookingName, setBookingName] = useState('');
    const [bookingTripId, setBookingTripId] = useState(null);
    const [bookingSeatCount, setBookingSeatCount] = useState(1);
    const [favorites, setFavorites] = useState([]);
    const [reminders, setReminders] = useState({});
    const [reminderMinutes, setReminderMinutes] = useState({});
    const [myBookings, setMyBookings] = useState([]);
    const [qrModalBooking, setQrModalBooking] = useState(null);

    // Trip filters (appear only after selecting a route)
    const [tripFilters, setTripFilters] = useState({
        status: '',
        busNumber: '',
        departureDate: '',
        availableSeats: ''
    });

    // Route filters (appear only before selecting a route)
    const [routeFilters, setRouteFilters] = useState({
        name: '',
        startLocation: '',
        endLocation: ''
    });

    useEffect(() => {
        fetchRoutes();
        fetchFavorites();
        fetchMyActiveBookings();
    }, []);

    const fetchMyActiveBookings = async () => {
        try {
            const { data } = await getMyActiveBookings();
            setMyBookings(data);
        } catch (err) {
            // ignore silently if not authenticated
        }
    };

    useEffect(() => {
        if (selectedRouteId) {
            fetchTripsForRoute(selectedRouteId);
            // Poll for updates every 10 seconds when a route is selected
            const interval = setInterval(() => fetchTripsForRoute(selectedRouteId), 10000);
            return () => clearInterval(interval);
        }
    }, [selectedRouteId]);

    const fetchRoutes = async () => {
        try {
            const { data } = await getRoutes();
            setRoutes(data);
        } catch {
            setError(t('generated.pages_citizen_CitizenTrips_load_routes_failed'));
        } finally {
            setLoadingRoutes(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const { data } = await getMyFavorites();
            setFavorites(data);
        } catch {}
    };

    const fetchTripsForRoute = async (routeId) => {
        setLoadingTrips(true);
        try {
            const { data } = await getTripsByRoute(routeId);
            // Filter out finished trips
            const activeTrips = data.filter(trip => trip.status !== 'Finished');
            setTrips(activeTrips);
        } catch {
            setError(t('generated.pages_citizen_CitizenTrips_load_trips_failed'));
        } finally {
            setLoadingTrips(false);
        }
    };

    const selectedRoute = routes.find(r => r.id === selectedRouteId);

    // ROUTE FILTER LOGIC
    const filteredRoutes = useMemo(() => routes.filter(route => {
        const matchName =
            !routeFilters.name ||
            route.name.toLowerCase().includes(routeFilters.name.toLowerCase());
        const matchStart =
            !routeFilters.startLocation ||
            route.startLocation.toLowerCase().includes(routeFilters.startLocation.toLowerCase());
        const matchEnd =
            !routeFilters.endLocation ||
            route.endLocation.toLowerCase().includes(routeFilters.endLocation.toLowerCase());
        return matchName && matchStart && matchEnd;
    }), [routes, routeFilters]);

    // TRIP FILTER LOGIC (after selecting a route)
    const filteredTrips = useMemo(() => trips.filter(trip => {
        const matchesStatus =
            !tripFilters.status ||
            trip.status.toLowerCase().includes(tripFilters.status.toLowerCase());
        const matchesBusNumber =
            !tripFilters.busNumber ||
            trip.busNumber.toLowerCase().includes(tripFilters.busNumber.toLowerCase());
        const matchesDepartureDate =
            !tripFilters.departureDate ||
            new Date(trip.departureTime).toLocaleDateString().includes(tripFilters.departureDate);
        const matchesAvailableSeats =
            !tripFilters.availableSeats ||
            trip.availableSeats.toString().includes(tripFilters.availableSeats);
        return matchesStatus && matchesBusNumber && matchesDepartureDate && matchesAvailableSeats;
    }), [trips, tripFilters]);

    useEffect(() => {
        // fetch scheduled reminders for visible trips
        const loadReminders = async () => {
            const map = {};
            await Promise.all(filteredTrips.map(async (trip) => {
                try {
                    const res = await getScheduledReminder(trip.id);
                    if (res?.data) map[trip.id] = res.data;
                } catch {
                    // ignore not found
                }
            }));
            setReminders(map);
        };
        loadReminders();
    }, [filteredTrips]);

    const handleBook = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const trip = trips.find(t => t.id === bookingTripId);
            if (!trip) throw new Error(t('generated.pages_citizen_CitizenTrips_trip_not_found'));
            if (bookingSeatCount <= 0) {
                setError(t('generated.pages_citizen_CitizenTrips_seat_count_min'));
                return;
            }
            if (bookingSeatCount > trip.availableSeats) {
                setError(t('generated.pages_citizen_CitizenTrips_not_enough_seats'));
                return;
            }

            const { data } = await createBooking({
                tripId: bookingTripId,
                passengerName: bookingName,
                seatCount: bookingSeatCount
            });

            setSuccess(t('generated.pages_citizen_CitizenTrips_booking_confirmed', { code: data.cancellationCode }));
            setBookingTripId(null);
            setBookingName('');
            setBookingSeatCount(1);
            await fetchTripsForRoute(selectedRouteId);

        } catch (err) {
            setError(err.response?.data?.Detailed || t('generated.pages_citizen_CitizenTrips_booking_failed'));
        }
    };

    const isFavorite = (tripId) => favorites.some(f => f.id === tripId);

    const toggleFavorite = async (tripId) => {
        try {
            if (isFavorite(tripId)) {
                await removeFromFavorites(tripId);
                setFavorites(favorites.filter(f => f.id !== tripId));
            } else {
                const trip = trips.find(t => t.id === tripId);
                if (trip) {
                    await addToFavorites({ ...trip, route: selectedRoute });
                    setFavorites([...favorites, { ...trip, route: selectedRoute }]);
                }
            }
        } catch {
            setError(t('generated.pages_citizen_CitizenTrips_update_favorites_failed'));
        }
    };

    // Modified to map exactly with your style guide design tokens
    const statusColors = {
        Scheduled: 'bg-[var(--wheat-light)] text-[var(--wheat-dark)] border border-[rgba(185,167,121,0.25)]',
        Started: 'bg-[var(--forest-100)] text-[var(--forest-dark)] border border-[rgba(66,129,119,0.2)]',
        Delayed: 'bg-[var(--wheat-light)] text-[var(--wheat-dark)] border border-[rgba(185,167,121,0.4)]',
        Finished: 'bg-[var(--surface-muted)] text-[#525050] border border-[rgba(66,129,119,0.08)]',
        Cancelled: 'bg-[rgba(107,31,42,0.08)] text-[var(--umber-dark)] border border-[rgba(107,31,42,0.2)]'
    };

    if (loadingRoutes)
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );

    return (
        <div className="content-wrapper py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h1 className="heading-lg font-bold text-[var(--charcoal)]">
                    {selectedRoute ? t('citizen.trips.tripsFor', { route: selectedRoute.name }) : t('citizen.trips.chooseRoute')}
                </h1>
                {selectedRoute && (
                    <button
                        onClick={() => {
                            setSelectedRouteId('');
                            setTrips([]);
                            setBookingTripId(null);
                            setSuccess('');
                            setError('');
                            setTripFilters({
                                status: '',
                                busNumber: '',
                                departureDate: '',
                                availableSeats: ''
                            });
                        }}
                        className="secondary-button px-5 py-2.5 text-sm"
                    >
                        {t('citizen.trips.changeRoute')}
                    </button>
                )}
            </div>

            {/* Custom Alert Box Integration */}
            {error && <div className="alert alert-error mb-6">{error}</div>}
            {success && <div className="alert alert-success mb-6">{success}</div>}

            {/* My QR Ticket section */}
            <div className="mb-6 card p-4">
                <h2 className="font-semibold">{t('citizen.qr.myTicket', 'My QR Ticket')}</h2>
                {myBookings.length === 0 && (
                    <p className="text-sm text-muted">{t('citizen.qr.noActiveTickets', 'No active tickets')}</p>
                )}
                {myBookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between mt-3">
                        <div className="text-sm">
                            <div className="font-medium">{t('admin.vehicles.name')}: {b.passengerName}</div>
                            <div className="text-muted text-xs">{t('citizen.trips.departureDate')}: {new Date(b.tripDepartureTimeUtc).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="secondary-button px-3 py-1 text-sm" onClick={() => setQrModalBooking(b)}>{t('citizen.qr.viewQr', 'View QR')}</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Modal */}
            {qrModalBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-[320px]">
                        <h3 className="font-semibold mb-3">{t('citizen.qr.qrFor', 'QR Ticket')}</h3>
                                        <div className="flex flex-col items-center gap-3">
                                                <div className="p-2 bg-white" id={`qr-wrapper-${qrModalBooking.id}`}>
                                                    <QRCode value={qrModalBooking.qrToken || ''} size={256} />
                                                </div>
                                            <div className="text-xs text-muted text-center break-words">{qrModalBooking.qrToken}</div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    className="secondary-button px-3 py-1 text-sm"
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(qrModalBooking.qrToken || '');
                                                            setSuccess(t('citizen.qr.copied', 'QR token copied'));
                                                            setTimeout(() => setSuccess(''), 2000);
                                                        } catch (err) {
                                                            setError(t('citizen.qr.copy_failed', 'Failed to copy'));
                                                            setTimeout(() => setError(''), 2000);
                                                        }
                                                    }}
                                                >
                                                    {t('citizen.qr.copyToken', 'Copy token')}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="secondary-button px-3 py-1 text-sm"
                                                    onClick={() => {
                                                        try {
                                                            try {
                                                                const wrapper = document.getElementById(`qr-wrapper-${qrModalBooking.id}`);
                                                                if (!wrapper) throw new Error('QR element not found');
                                                                const svg = wrapper.querySelector('svg');
                                                                if (!svg) throw new Error('SVG not found');

                                                                const serializer = new XMLSerializer();
                                                                const svgString = serializer.serializeToString(svg);
                                                                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                                                                const url = URL.createObjectURL(svgBlob);
                                                                const img = new Image();
                                                                img.onload = () => {
                                                                    const canvas = document.createElement('canvas');
                                                                    canvas.width = img.width;
                                                                    canvas.height = img.height;
                                                                    const ctx = canvas.getContext('2d');
                                                                    ctx.fillStyle = '#ffffff';
                                                                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                                    ctx.drawImage(img, 0, 0);
                                                                    URL.revokeObjectURL(url);
                                                                    const dataUrl = canvas.toDataURL('image/png');
                                                                    const a = document.createElement('a');
                                                                    a.href = dataUrl;
                                                                    a.download = `qr_${qrModalBooking.id}.png`;
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    a.remove();
                                                                };
                                                                img.onerror = () => { throw new Error('Failed to rasterize SVG'); };
                                                                img.src = url;
                                                            } catch (err) {
                                                                setError(t('citizen.qr.download_failed', 'Failed to download image'));
                                                                setTimeout(() => setError(''), 2000);
                                                            }
                                                        } catch (err) {
                                                            setError(t('citizen.qr.download_failed', 'Failed to download image'));
                                                            setTimeout(() => setError(''), 2000);
                                                        }
                                                    }}
                                                >
                                                    {t('common.download')}
                                                </button>

                                                <button className="primary-button" onClick={() => setQrModalBooking(null)}>{t('common.close')}</button>
                                            </div>
                                        </div>
                    </div>
                </div>
            )}

            {/* ROUTES LIST */}
            {!selectedRoute && (
                <>
                    {/* ROUTE SEARCH FILTERS */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                            type="text"
                            placeholder={t('citizen.trips.searchRouteName')}
                            value={routeFilters.name}
                            onChange={(e) =>
                                setRouteFilters({ ...routeFilters, name: e.target.value })
                            }
                            className="input-field"
                        />
                        <input
                            type="text"
                            placeholder={t('citizen.trips.startLocation')}
                            value={routeFilters.startLocation}
                            onChange={(e) =>
                                setRouteFilters({ ...routeFilters, startLocation: e.target.value })
                            }
                            className="input-field"
                        />
                        <input
                            type="text"
                            placeholder={t('citizen.trips.endLocation')}
                            value={routeFilters.endLocation}
                            onChange={(e) =>
                                setRouteFilters({ ...routeFilters, endLocation: e.target.value })
                            }
                            className="input-field"
                        />
                    </div>

                    <div className="grid gap-4">
                        {filteredRoutes.map(route => (
                            <button
                                key={route.id}
                                onClick={async () => {
                                    setSelectedRouteId(route.id);
                                    await fetchTripsForRoute(route.id);
                                }}
                                className="text-start card p-6 hover:bg-[var(--surface-soft)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
                            >
                                <div className="font-semibold text-lg text-[var(--charcoal)]">{route.name}</div>
                                <div className="text-muted text-sm mt-2 flex items-center gap-2">
                                    <span>{route.startLocation}</span>
                                    <span className="text-[var(--forest)] font-bold">→</span>
                                    <span>{route.endLocation}</span>
                                </div>
                            </button>
                        ))}

                        {filteredRoutes.length === 0 && (
                            <p className="text-center text-muted py-12 card bg-surface-muted">
                                {t('citizen.trips.noRouteMatches')}
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* TRIPS */}
            {selectedRoute && (
                <>
                    {/* TRIP FILTERS */}
                    <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <select
                            value={tripFilters.status}
                            onChange={(e) => setTripFilters({ ...tripFilters, status: e.target.value })}
                            className="input-field appearance-none"
                        >
                            <option value="">{t('citizen.trips.allStatus')}</option>
                            <option value="scheduled">{t('citizen.trips.statusScheduled')}</option>
                            <option value="started">{t('citizen.trips.statusStarted')}</option>
                            <option value="delayed">{t('citizen.trips.statusDelayed')}</option>
                            <option value="finished">{t('citizen.trips.statusFinished')}</option>
                        </select>
                        <input
                            type="text"
                            placeholder={t('citizen.trips.busNumber')}
                            value={tripFilters.busNumber}
                            onChange={(e) => setTripFilters({ ...tripFilters, busNumber: e.target.value })}
                            className="input-field"
                        />
                        <input
                            type="text"
                            placeholder={t('citizen.trips.departureDate')}
                            value={tripFilters.departureDate}
                            onChange={(e) => setTripFilters({ ...tripFilters, departureDate: e.target.value })}
                            className="input-field"
                        />
                        <input
                            type="number"
                            placeholder={t('citizen.trips.availableSeats')}
                            value={tripFilters.availableSeats}
                            onChange={(e) => setTripFilters({ ...tripFilters, availableSeats: e.target.value })}
                            className="input-field"
                        />
                    </div>

                    <div className="grid gap-6">
                        {loadingTrips && (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--forest)]"></div>
                            </div>
                        )}

                        {!loadingTrips && filteredTrips.map(trip => (
                            <div key={trip.id} className="card p-6 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-bold text-lg text-[var(--charcoal)]">
                                                {trip.busNumber}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${statusColors[trip.status] || ''}`}>
                                                {t(`citizen.trips.status_${trip.status}`, { defaultValue: trip.status })}
                                            </span>
                                        </div>
                                        <div className="text-muted text-sm space-y-1">
                                            <div><span className="font-medium">{t('citizen.trips.fromLabel')}:</span> {selectedRoute.startLocation}</div>
                                            <div><span className="font-medium">{t('citizen.trips.toLabel')}:</span> {selectedRoute.endLocation}</div>
                                            <div className="pt-1 text-[var(--charcoal)] font-medium">
                                                📅 {t('citizen.trips.departure')}: {new Date(trip.departureTime).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-xs text-[var(--forest-dark)] font-semibold bg-[var(--forest-100)] inline-block px-2.5 py-1 rounded-md mt-2">
                                            💺 {trip.availableSeats} / {trip.totalSeats} {t('citizen.trips.availableSeats', { defaultValue: 'available' })}
                                        </div>
                                    </div>

                                    {/* Action Utilities Group */}
                                    <div className="flex items-center gap-3 self-end sm:self-center flex-wrap">
                                        <button 
                                            onClick={() => toggleFavorite(trip.id)} 
                                            className="p-2.5 hover:bg-[var(--surface-soft)] rounded-xl transition-colors border border-[rgba(66,129,119,0.12)] text-xl"
                                            title="Favorite"
                                        >
                                            {isFavorite(trip.id) ? '❤️' : '🤍'}
                                        </button>
                                        
                                        <div className="flex items-center gap-1.5 bg-[var(--surface-soft)] p-1.5 rounded-xl border border-[rgba(66,129,119,0.12)]">
                                            <select
                                                value={reminderMinutes[trip.id] ?? 30}
                                                onChange={(e) => setReminderMinutes({
                                                    ...reminderMinutes,
                                                    [trip.id]: parseInt(e.target.value, 10)
                                                })}
                                                className="bg-transparent border-none px-2 py-1 text-xs font-medium focus:outline-none text-[var(--charcoal-medium)]"
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
                                                            const next = { ...reminders };
                                                            delete next[trip.id];
                                                            setReminders(next);
                                                        } else {
                                                            const minutes = reminderMinutes[trip.id] ?? 30;
                                                            const payload = {
                                                                tripId: trip.id,
                                                                tripNumber: trip.busNumber || trip.tripNumber || '',
                                                                departureTimeUtc: new Date(trip.departureTime).toISOString(),
                                                                vehicleInfo: trip.vehicle || '',
                                                                routeInfo: selectedRoute?.name || '',
                                                                startLocation: selectedRoute?.startLocation || '',
                                                                destination: selectedRoute?.endLocation || '',
                                                                reminderMinutesBeforeDeparture: minutes
                                                            };
                                                            const res = await createScheduledReminder(payload);
                                                            setReminders({ ...reminders, [trip.id]: res.data });
                                                        }
                                                    } catch (err) {
                                                        setError('Failed to update reminder');
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-[var(--surface-muted)] text-sm rounded-lg transition-colors"
                                                title={reminders[trip.id] ? 'Cancel reminder' : 'Set reminder'}
                                            >
                                                {reminders[trip.id] ? '🔔' : '🔕'}
                                            </button>
                                        </div>

                                        {trip.availableSeats > 0 && trip.status === 'Scheduled' && new Date(trip.departureTime) > new Date() && (
                                            <button 
                                                onClick={() => { setBookingTripId(trip.id); setBookingSeatCount(1); setBookingName(''); }}
                                                className="primary-button px-5 py-2.5 text-sm"
                                            >
                                                {t('citizen.trips.reserve')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Booking dynamic inline form container */}
                                {bookingTripId === trip.id && (
                                    <form onSubmit={handleBook} className="mt-4 pt-4 border-t border-[rgba(66,129,119,0.12)] grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        <div>
                                            <label className="form-label">{t('citizen.trips.bookingFullName')}</label>
                                            <input 
                                                placeholder={t('citizen.trips.bookingFullName')} 
                                                value={bookingName} 
                                                onChange={e => setBookingName(e.target.value)} 
                                                required 
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">{t('citizen.trips.availableSeats')}</label>
                                            <input 
                                                type="number" 
                                                min={1} 
                                                max={trip.availableSeats} 
                                                value={bookingSeatCount} 
                                                onChange={e => setBookingSeatCount(parseInt(e.target.value || '1', 10))} 
                                                required 
                                                className="input-field"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="submit" className="primary-button flex-1 py-3 text-sm">
                                                {t('citizen.trips.confirmBooking')}
                                            </button>
                                            <button type="button" onClick={() => setBookingTripId(null)} className="danger-button flex-1 py-3 text-sm">
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ))}

                        {!loadingTrips && filteredTrips.length === 0 && (
                            <p className="text-center text-muted py-12 card bg-surface-muted">
                                {trips.length === 0 ? t('citizen.trips.noTripsAvailableForRoute') : t('citizen.trips.noTripsMatchFilters')}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}