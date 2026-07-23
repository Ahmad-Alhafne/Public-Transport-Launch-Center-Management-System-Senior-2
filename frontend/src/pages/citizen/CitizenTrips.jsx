import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRoutes, getTripsByRoute, createBooking, addToFavorites, removeFromFavorites, getMyFavorites, getScheduledReminder, createScheduledReminder, deleteScheduledReminder, getMyActiveBookings, createPaymentIntent, confirmPayment, cancelBooking } from '../../services/api';

export default function CitizenTrips() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
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
    const [paymentCardNumber, setPaymentCardNumber] = useState('');
    const [paymentExpMonth, setPaymentExpMonth] = useState(new Date().getMonth() + 1);
    const [paymentExpYear, setPaymentExpYear] = useState(new Date().getFullYear());
    const [paymentCvc, setPaymentCvc] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [reminders, setReminders] = useState({});
    const [reminderMinutes, setReminderMinutes] = useState({});
    const [myBookings, setMyBookings] = useState([]);

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
    const TICKET_PRICE = 5.00;

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
    const bookingTrip = trips.find(t => t.id === bookingTripId);

    const translateTripStatus = (status) => {
        if (!status) return '';
        const normalized = status.replace(/\s+/g, '');
        const normalizedTitle = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        return t(`citizen.trips.status_${normalizedTitle}`, {
            defaultValue: t(`citizen.trips.status${normalizedTitle}`, { defaultValue: status })
        });
    };

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
        setPaymentProcessing(true);
        let createdBookingCancellationCode = null;

        try {
            const trip = trips.find(t => t.id === bookingTripId);
            if (!trip) throw new Error(t('generated.pages_citizen_CitizenTrips_trip_not_found'));
            if (!Number.isInteger(bookingSeatCount) || bookingSeatCount < 1) {
                setError(t('generated.pages_citizen_CitizenTrips_seat_count_min'));
                return;
            }
            if (!bookingName.trim()) {
                setError(t('generated.pages_citizen_CitizenTrips_name_required', 'Please enter your full name.'));
                return;
            }
            if (!paymentCardNumber.trim() || !paymentCvc.trim()) {
                setError(t('generated.pages_citizen_CitizenTrips_payment_details_required', 'Please enter valid payment details.'));
                return;
            }
            if (paymentExpMonth < 1 || paymentExpMonth > 12 || paymentExpYear < new Date().getFullYear()) {
                setError(t('generated.pages_citizen_CitizenTrips_payment_date_invalid', 'Please enter a valid expiration date.'));
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

            createdBookingCancellationCode = data.cancellationCode;
            const paymentAmount = Number((bookingSeatCount * TICKET_PRICE).toFixed(2));
            const paymentIntentResponse = await createPaymentIntent({
                bookingId: data.id,
                amount: paymentAmount,
                currency: 'usd',
                paymentMethod: 'card'
            });

            const paymentIntentId = paymentIntentResponse?.data?.paymentIntentId
                || paymentIntentResponse?.data?.PaymentIntentId
                || paymentIntentResponse?.data?.payment_intent_id;

            if (!paymentIntentId) {
                throw new Error(t('citizen.trips.paymentIntentMissing', 'Unable to start payment. Please try again.'));
            }

            // Map common test card numbers to Stripe test tokens to avoid sending raw card numbers.
            const normalizedCard = (paymentCardNumber || '').replace(/\s+/g, '');
            let paymentMethodToken = null;
            if (/^tok_/.test(normalizedCard)) {
                paymentMethodToken = normalizedCard; // already a token
            } else if (normalizedCard === '4242424242424242') {
                paymentMethodToken = 'tok_visa';
            }

            const confirmPayload = paymentMethodToken
                ? { paymentIntentId, paymentMethodToken }
                : {
                    paymentIntentId,
                    cardNumber: paymentCardNumber,
                    expMonth: paymentExpMonth,
                    expYear: paymentExpYear,
                    cvc: paymentCvc
                };

            const confirmResponse = await confirmPayment(confirmPayload);
            setShowPaymentModal(false);

            // PaymentService returns a PaymentDto with a numeric `status` enum.
            const status = confirmResponse?.data?.status;
            const SUCCEEDED = 1; // PaymentStatus.Succeeded
            const REQUIRES_ACTION = 3; // PaymentStatus.RequiresAction
            const FAILED = 2; // PaymentStatus.Failed
            const PENDING = 0; // PaymentStatus.Pending

            if (!(status === SUCCEEDED || status === 'succeeded' || status === 'Succeeded' || status === PENDING || status === 'pending' || status === 'Pending' || status === REQUIRES_ACTION || status === 'requires_action' || status === 'RequiresAction')) {
                throw new Error(t('citizen.trips.paymentFailed', 'Payment failed. Please check card details and try again.'));
            }

            setBookingTripId(null);
            setBookingName('');
            setBookingSeatCount(1);
            setPaymentCardNumber('');
            setPaymentExpMonth(new Date().getMonth() + 1);
            setPaymentExpYear(new Date().getFullYear());
            setPaymentCvc('');
            
            const message = status === SUCCEEDED || status === 'succeeded' || status === 'Succeeded'
                ? `${t('generated.pages_citizen_CitizenTrips_booking_confirmed', { code: data.cancellationCode })} ${t('admin.citizen.trips.paymentSuccess')}`
                : status === PENDING || status === 'pending' || status === 'Pending'
                ? `${t('generated.pages_citizen_CitizenTrips_booking_confirmed', { code: data.cancellationCode })} ${t('citizen.trips.paymentPending')}`
                : `${t('generated.pages_citizen_CitizenTrips_booking_confirmed', { code: data.cancellationCode })} ${t('citizen.trips.paymentRequiresAction')}`;
            
            navigate('/citizen/bookings', { 
                replace: true,
                state: { paymentMessage: message, messageType: 'success' }
            });

        } catch (err) {
            if (createdBookingCancellationCode) {
                try {
                    await cancelBooking({ cancellationCode: createdBookingCancellationCode });
                } catch {
                    // ignore cancellation failure, show payment error instead
                }
            }
            const errorMessage = err?.response?.data?.detail
                || err?.response?.data?.Message
                || err?.response?.data?.message
                || err?.response?.data?.error
                || err?.response?.data?.title
                || err?.response?.data?.Detailed
                || err?.message
                || t('generated.pages_citizen_CitizenTrips_payment_failed');
            
            navigate('/citizen/bookings', {
                replace: true,
                state: { paymentMessage: errorMessage, messageType: 'error' }
            });
        } finally {
            setPaymentProcessing(false);
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
                <h1 style={{margin:'20px 0'}} className="heading-lg font-bold text-[var(--charcoal)]">
                    {selectedRoute ? t('citizen.trips.tripsFor', { route: selectedRoute.name }) : t('citizen.trips.chooseRoute')}
                </h1>
                {selectedRoute && (
                    <button
                        onClick={() => {
                            setSelectedRouteId('');
                            setTrips([]);
                            setBookingTripId(null);
                            setPaymentCardNumber('');
                            setPaymentExpMonth(new Date().getMonth() + 1);
                            setPaymentExpYear(new Date().getFullYear());
                            setPaymentCvc('');
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
                                                {translateTripStatus(trip.status)}
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
                                                <option value={30}>{t('driver.trips.reminder.minutes.30','30 minutes')}</option>
                                                <option value={45}>{t('driver.trips.reminder.minutes.45','45 minutes')}</option>
                                                <option value={60}>{t('driver.trips.reminder.minutes.60','60 minutes')}</option>
                                                <option value={120}>{t('driver.trips.reminder.minutes.120','120 minutes')}</option>
                                                <option value={360}>{t('driver.trips.reminder.minutes.360','360 minutes')}</option>
                                                <option value={1440}>{t('driver.trips.reminder.minutes.1440','1 day')}</option>
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
                                                        setError(t('driver.trips.reminder.updateFailed','Failed to update reminder'));
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
                                                type="button"
                                                onClick={() => {
                                                    setBookingTripId(trip.id);
                                                    setBookingSeatCount(1);
                                                    setBookingName('');
                                                    setPaymentCardNumber('');
                                                    setPaymentExpMonth(new Date().getMonth() + 1);
                                                    setPaymentExpYear(new Date().getFullYear());
                                                    setPaymentCvc('');
                                                    setShowPaymentModal(true);
                                                }}
                                                className="primary-button px-5 py-2.5 text-sm"
                                            >
                                                {t('citizen.trips.reserveAndPay', 'Reserve & pay')}
                                            </button>
                                        )}
                                    </div>
                                </div>

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

            {showPaymentModal && bookingTrip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                            <div className="flex items-start justify-between gap-4 border-b border-[rgba(66,129,119,0.18)] p-5">
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--charcoal)]">{t('citizen.trips.paymentModalTitle', 'Confirm booking and pay')}</h2>
                                <p className="text-sm text-[var(--charcoal-medium)]">{t('citizen.trips.paymentModalSubtitle', 'Enter payment details to complete your reservation.')}</p>
                            </div>
                            <button
                                type="button"
                                title={t('common.close')}
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setBookingTripId(null);
                                    setPaymentCardNumber('');
                                    setPaymentExpMonth(new Date().getMonth() + 1);
                                    setPaymentExpYear(new Date().getFullYear());
                                    setPaymentCvc('');
                                }}
                                className="text-xl font-semibold text-[var(--charcoal-medium)] hover:text-[var(--charcoal)]"
                            >
                                {t('common.closeSymbol','×')}
                            </button>
                        </div>
                        <div className="p-5 grid gap-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-[rgba(66,129,119,0.14)] p-4 bg-[var(--surface-soft)]">
                                    <div className="text-sm text-[var(--charcoal-medium)] mb-2">{t('citizen.trips.selectedTrip', 'Selected trip')}</div>
                                    <div className="font-semibold text-[var(--charcoal)] mb-1">{bookingTrip.busNumber || bookingTrip.tripNumber}</div>
                                    <div className="text-sm">{selectedRoute?.startLocation} <span className="text-[var(--forest)] font-bold">{t('citizen.trips.directionArrow','→')}</span> {selectedRoute?.endLocation}</div>
                                    <div className="text-sm mt-2">{new Date(bookingTrip.departureTime).toLocaleString()}</div>
                                    <div className="text-sm mt-2">{t('citizen.trips.availableSeats', { defaultValue: 'available' })}: {bookingTrip.availableSeats}</div>
                                </div>
                                <div className="rounded-2xl border border-[rgba(66,129,119,0.14)] p-4 bg-[var(--surface-soft)]">
                                    <div className="text-sm text-[var(--charcoal-medium)] mb-2">{t('citizen.trips.paymentSummary', 'Payment summary')}</div>
                                    <div className="text-lg font-semibold text-[var(--charcoal)]">{t('citizen.trips.totalAmount', { amount: (bookingSeatCount * TICKET_PRICE).toFixed(2), currency: 'USD', defaultValue: '{{amount}} {{currency}}' })}</div>
                                    <div className="text-sm text-[var(--charcoal-medium)] mt-2">{t('citizen.trips.seatCount', 'Seats')}: {bookingSeatCount}</div>
                                </div>
                            </div>

                            <form onSubmit={handleBook} className="grid gap-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                                        <label className="form-label">{t('citizen.trips.seatCount', 'Seats')}</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={bookingTrip.availableSeats}
                                            step={1}
                                            value={bookingSeatCount}
                                            onChange={e => setBookingSeatCount(Number(e.target.value))}
                                            required
                                            className="input-field"
                                        />
                                        <p className="mt-1 text-xs text-[var(--charcoal-medium)]">
                                            {t('citizen.trips.seatCountRange', {
                                                count: bookingTrip.availableSeats,
                                                defaultValue: 'Choose between 1 and {{count}} seats.'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="form-label">{t('citizen.trips.cardNumber', 'Card number')}</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder={t('citizen.trips.cardPlaceholder','4242 4242 4242 4242')}
                                                value={paymentCardNumber}
                                                onChange={e => setPaymentCardNumber(e.target.value)}
                                                required
                                                className="input-field"
                                            />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="form-label">{t('citizen.trips.expMonth', 'Exp. month')}</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={12}
                                            value={paymentExpMonth}
                                            onChange={e => setPaymentExpMonth(parseInt(e.target.value || '1', 10))}
                                            required
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">{t('citizen.trips.expYear', 'Exp. year')}</label>
                                        <input
                                            type="number"
                                            min={new Date().getFullYear()}
                                            max={2050}
                                            value={paymentExpYear}
                                            onChange={e => setPaymentExpYear(parseInt(e.target.value || String(new Date().getFullYear()), 10))}
                                            required
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">{t('citizen.trips.cvc', 'CVC')}</label>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder={t('citizen.trips.cvcPlaceholder','123')}
                                                value={paymentCvc}
                                                onChange={e => setPaymentCvc(e.target.value)}
                                                required
                                                className="input-field"
                                            />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                    <button type="submit" disabled={paymentProcessing} className="primary-button flex-1 py-3 text-sm">
                                        {paymentProcessing ? t('citizen.trips.processingPayment', 'Processing payment...') : t('citizen.trips.payAndConfirm', 'Pay & confirm booking')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setBookingTripId(null);
                                            setPaymentCardNumber('');
                                            setPaymentExpMonth(new Date().getMonth() + 1);
                                            setPaymentExpYear(new Date().getFullYear());
                                            setPaymentCvc('');
                                        }}
                                        disabled={paymentProcessing}
                                        className="danger-button flex-1 py-3 text-sm"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
