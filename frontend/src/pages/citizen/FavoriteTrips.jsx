import { useState, useEffect } from 'react';
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
            setError('Failed to load favorite trips');
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
            if (!trip) throw new Error('Trip not found');
            if (bookingSeatCount <= 0) {
                setError('Seat count must be at least 1.');
                return;
            }
            if (bookingSeatCount > trip.availableSeats) {
                setError('Not enough available seats for this trip.');
                return;
            }

            const { data } = await createBooking({
                tripId: bookingTripId,
                passengerName: bookingName,
                seatCount: bookingSeatCount
            });
            setSuccess(`Booking confirmed! Cancellation code: ${data.cancellationCode}`);
            setBookingTripId(null);
            setBookingName('');
            setBookingSeatCount(1);
            await fetchFavorites(); // Refresh to update available seats
        } catch (err) { setError(err.response?.data?.Detailed || 'Booking failed'); }
    };

    const handleRemoveFavorite = async (tripId) => {
        try {
            await removeFromFavorites(tripId);
            setFavorites(favorites.filter(f => f.id !== tripId));
            setConfirmingRemove(null);
        } catch (err) {
            setError('Failed to remove favorite');
        }
    };

    const statusColors = { Scheduled: 'text-blue-400 bg-blue-500/10', Started: 'text-emerald-400 bg-emerald-500/10', Delayed: 'text-yellow-400 bg-yellow-500/10', Finished: 'text-slate-400 bg-slate-500/10', Cancelled: 'text-red-400 bg-red-500/10' };

    const filteredFavorites = favorites.filter(trip => {
        const matchesFrom = !filters.from || (trip.route?.startLocation || '').toLowerCase().includes(filters.from.toLowerCase());
        const matchesTo = !filters.to || (trip.route?.endLocation || '').toLowerCase().includes(filters.to.toLowerCase());
        const matchesDepartureDate = !filters.departureDate || new Date(trip.departureTime).toLocaleDateString().includes(filters.departureDate);
        const matchesAvailableSeats = !filters.availableSeats || trip.availableSeats.toString().includes(filters.availableSeats);
        return matchesFrom && matchesTo && matchesDepartureDate && matchesAvailableSeats;
    });

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Favorite Trips</h1>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    type="text"
                    placeholder="Filter by starting location"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Filter by destination"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="text"
                    placeholder="Filter by departure date"
                    value={filters.departureDate}
                    onChange={(e) => setFilters({ ...filters, departureDate: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="number"
                    placeholder="Filter by available seats"
                    value={filters.availableSeats}
                    onChange={(e) => setFilters({ ...filters, availableSeats: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="grid gap-4">
                {filteredFavorites.length > 0 ? filteredFavorites.map(trip => (
                    <div key={trip.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-lg">🚌 {trip.busNumber}</h3>
                                </div>
                                <div className="text-slate-400 text-sm mt-2">
                                    <div><span className="text-slate-500">From:</span> {trip.route?.startLocation || 'N/A'}</div>
                                    <div><span className="text-slate-500">To:</span> {trip.route?.endLocation || 'N/A'}</div>
                                    <div className="mt-1"><span className="text-slate-500">Departure:</span> {new Date(trip.departureTime).toLocaleString()}</div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">💺 Seats: {trip.totalSeats} </p>
                            </div>
                            {trip.status === 'Scheduled' &&
                                trip.availableSeats > 0 &&
                                new Date(trip.departureTime) > new Date() && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setConfirmingRemove(trip.id)}
                                        className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs hover:bg-red-600/30"
                                    >
                                        Remove
                                    </button>
                                    <button
                                        onClick={() => { setBookingTripId(trip.id); setBookingSeatCount(1); setBookingName(''); }}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm transition-colors"
                                    >
                                        Reserve
                                    </button>
                                </div>
                            )}
                            {(!(trip.status === 'Scheduled' &&
                                trip.availableSeats > 0 &&
                                new Date(trip.departureTime) > new Date()) && (
                                <button
                                    onClick={() => setConfirmingRemove(trip.id)}
                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-xs hover:bg-red-600/30"
                                >
                                    Remove
                                </button>
                            ))}
                        </div>

                        {bookingTripId === trip.id && (
                            <form onSubmit={handleBook} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    placeholder="Your full name"
                                    value={bookingName}
                                    onChange={e => setBookingName(e.target.value)}
                                    required
                                    className="px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <input
                                    type="number"
                                    min={1}
                                    max={trip.availableSeats}
                                    placeholder="Seats"
                                    value={bookingSeatCount}
                                    onChange={e => setBookingSeatCount(parseInt(e.target.value || '1', 10))}
                                    required
                                    className="px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                                />
                                <div className="flex gap-3">
                                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm transition-colors">Confirm</button>
                                    <button type="button" onClick={() => setBookingTripId(null)} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors">Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                )) : (
                    <p className="text-center text-slate-500 py-10">
                        {favorites.length === 0 
                            ? 'No favorite trips yet. Add some from the Trips page!'
                            : 'No favorite trips match your filters.'
                        }
                    </p>
                )}
            </div>

            <ConfirmationModal
                open={!!confirmingRemove}
                title="Confirm Remove Favorite"
                message="Are you sure you want to remove this trip from your favorites?"
                confirmText="Remove"
                cancelText="Cancel"
                danger
                onConfirm={() => handleRemoveFavorite(confirmingRemove)}
                onCancel={() => setConfirmingRemove(null)}
            />
        </div>
    );
}