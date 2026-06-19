import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyFavorites, createBooking, removeFromFavorites } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function FavoriteTrips() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [bookingName, setBookingName] = useState('');
    const [bookingTripId, setBookingTripId] = useState(null);
    const [bookingSeatCount, setBookingSeatCount] = useState(1);
    const [confirmingRemove, setConfirmingRemove] = useState(null);
    const { t } = useTranslation();

    const [filters, setFilters] = useState({
        from: '',
        to: '',
        departureDate: '',
        availableSeats: ''
    });

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const { data } = await getMyFavorites();
            // Filter out finished trips
            const activeFavorites = data.filter(trip => trip.status !== 'Finished');
            setFavorites(activeFavorites);
        } catch {
            setError(t('citizen.favoriteTrips.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchFavorites();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchFavorites, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleBook = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            const trip = favorites.find(t => t.id === bookingTripId);
            if (!trip) throw new Error(t('citizen.favoriteTrips.tripNotFound'));
            if (bookingSeatCount <= 0) {
                setError(t('citizen.favoriteTrips.seatCountMin'));
                return;
            }
            if (bookingSeatCount > trip.availableSeats) {
                setError(t('citizen.favoriteTrips.notEnoughSeats'));
                return;
            }

            const { data } = await createBooking({
                tripId: bookingTripId,
                passengerName: bookingName,
                seatCount: bookingSeatCount
            });
            setSuccess(t('citizen.favoriteTrips.bookingConfirmed', { code: data.cancellationCode }));
            setBookingTripId(null);
            setBookingName('');
            setBookingSeatCount(1);
            await fetchFavorites(); // Refresh to update available seats
        } catch (err) { 
            setError(err.response?.data?.Detailed || t('citizen.favoriteTrips.bookingFailed')); 
        }
    };

    const handleRemoveFavorite = async (tripId) => {
        try {
            await removeFromFavorites(tripId);
            setFavorites(favorites.filter(f => f.id !== tripId));
            setConfirmingRemove(null);
        } catch (err) {
            setError(t('citizen.favoriteTrips.removeFailed'));
        }
    };

    // Design-system compliant token mapping for vehicle states
    const statusColors = { 
        Scheduled: 'bg-[var(--wheat-light)] text-[var(--wheat-dark)] border border-[rgba(185,167,121,0.25)]', 
        Started: 'bg-[var(--forest-100)] text-[var(--forest-dark)] border border-[rgba(66,129,119,0.2)]', 
        Delayed: 'bg-[var(--wheat-light)] text-[var(--wheat-dark)] border border-[rgba(185,167,121,0.4)]', 
        Finished: 'bg-[var(--surface-muted)] text-[#525050] border border-[rgba(66,129,119,0.08)]', 
        Cancelled: 'bg-[rgba(107,31,42,0.08)] text-[var(--umber-dark)] border border-[rgba(107,31,42,0.2)]' 
    };

    const filteredFavorites = favorites.filter(trip => {
        const matchesFrom = !filters.from || (trip.route?.startLocation || '').toLowerCase().includes(filters.from.toLowerCase());
        const matchesTo = !filters.to || (trip.route?.endLocation || '').toLowerCase().includes(filters.to.toLowerCase());
        const matchesDepartureDate = !filters.departureDate || new Date(trip.departureTime).toLocaleDateString().includes(filters.departureDate);
        const matchesAvailableSeats = !filters.availableSeats || trip.availableSeats.toString().includes(filters.availableSeats);
        return matchesFrom && matchesTo && matchesDepartureDate && matchesAvailableSeats;
    });

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );
    }

    return (
        <div className="content-wrapper py-6">
            <h1 className="text-2xl font-bold mb-6 text-[var(--charcoal)]">
                {t('citizen.favoriteTrips.title')}
            </h1>
            
            {error && <div className="alert alert-error mb-6">{error}</div>}
            {success && <div className="alert alert-success mb-6">{success}</div>}

            {/* Parameter Search Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder={t('citizen.favoriteTrips.filterByStart')}
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder={t('citizen.favoriteTrips.filterByDestination')}
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder={t('citizen.favoriteTrips.filterByDepartureDate')}
                    value={filters.departureDate}
                    onChange={(e) => setFilters({ ...filters, departureDate: e.target.value })}
                    className="input-field"
                />
                <input
                    type="number"
                    placeholder={t('citizen.favoriteTrips.filterByAvailableSeats')}
                    value={filters.availableSeats}
                    onChange={(e) => setFilters({ ...filters, availableSeats: e.target.value })}
                    className="input-field"
                />
            </div>

            {/* Main Favorites Container */}
            <div className="grid gap-4">
                {filteredFavorites.length > 0 ? filteredFavorites.map(trip => (
                    <div key={trip.id} className="card p-6 border border-[rgba(66,129,119,0.1)]">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg text-[var(--charcoal)]">🚌 {trip.busNumber}</h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${statusColors[trip.status] || 'bg-[var(--surface-muted)] text-muted'}`}>
                                        {trip.status}
                                    </span>
                                </div>
                                <div className="text-sm text-muted space-y-0.5">
                                    <div><span className="font-medium text-[var(--charcoal-medium)]">{t('citizen.favoriteTrips.fromLabel')}:</span> {trip.route?.startLocation || t('citizen.favoriteTrips.notAvailable')}</div>
                                    <div><span className="font-medium text-[var(--charcoal-medium)]">{t('citizen.favoriteTrips.toLabel')}:</span> {trip.route?.endLocation || t('citizen.favoriteTrips.notAvailable')}</div>
                                    <div className="pt-1"><span className="font-medium text-[var(--charcoal-medium)]">{t('citizen.favoriteTrips.departureLabel')}:</span> {new Date(trip.departureTime).toLocaleString()}</div>
                                </div>
                                <p className="text-xs text-muted font-medium pt-1">
                                    💺 {t('citizen.favoriteTrips.seatsLabel')}: <span className="font-mono text-[var(--charcoal-medium)]">{trip.totalSeats}</span> (💺 {trip.availableSeats} {t('citizen.favoriteTrips.filterByAvailableSeats').toLowerCase()})
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <button
                                    onClick={() => setConfirmingRemove(trip.id)}
                                    className="danger-button px-3 py-1.5 text-xs font-medium"
                                >
                                    {t('citizen.favoriteTrips.remove')}
                                </button>
                                
                                {trip.status === 'Scheduled' && trip.availableSeats > 0 && new Date(trip.departureTime) > new Date() && (
                                    <button
                                        onClick={() => { setBookingTripId(trip.id); setBookingSeatCount(1); setBookingName(''); }}
                                        className="px-4 py-2 bg-[var(--forest)] hover:bg-[var(--forest-dark)] text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                                    >
                                        {t('citizen.favoriteTrips.reserve')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Expandable Inline Reservation Input Forms */}
                        {bookingTripId === trip.id && (
                            <form onSubmit={handleBook} className="mt-5 pt-5 border-t border-[rgba(66,129,119,0.08)] grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    placeholder={t('citizen.favoriteTrips.yourFullName')}
                                    value={bookingName}
                                    onChange={e => setBookingName(e.target.value)}
                                    required
                                    className="input-field"
                                />
                                <input
                                    type="number"
                                    min={1}
                                    max={trip.availableSeats}
                                    placeholder={t('citizen.favoriteTrips.seatsPlaceholder')}
                                    value={bookingSeatCount}
                                    onChange={e => setBookingSeatCount(parseInt(e.target.value || '1', 10))}
                                    required
                                    className="input-field"
                                />
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 px-4 py-2 bg-[var(--forest)] hover:bg-[var(--forest-dark)] text-white rounded-xl text-sm font-medium transition-colors shadow-sm">{t('citizen.favoriteTrips.confirmBooking')}</button>
                                    <button type="button" onClick={() => setBookingTripId(null)} className="flex-1 px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border border-[rgba(66,129,119,0.15)] rounded-xl text-sm font-medium transition-colors">{t('common.cancel')}</button>
                                </div>
                            </form>
                        )}
                    </div>
                )) : (
                    <p className="text-center text-muted py-12 card bg-[var(--surface-muted)]">
                        {favorites.length === 0 
                            ? t('citizen.favoriteTrips.noFavoritesYet')
                            : t('citizen.favoriteTrips.noMatches')
                        }
                    </p>
                )}
            </div>

            {/* Global Confirmation Removal Portals */}
            <ConfirmationModal
                open={!!confirmingRemove}
                title={t('citizen.favoriteTrips.confirmRemoveTitle')}
                message={t('citizen.favoriteTrips.confirmRemoveMessage')}
                confirmText={t('citizen.favoriteTrips.remove')}
                cancelText={t('common.cancel')}
                danger
                onConfirm={() => handleRemoveFavorite(confirmingRemove)}
                onCancel={() => setConfirmingRemove(null)}
            />
        </div>
    );
}