import { useState, useEffect } from 'react';
import { getRoutes, getTripsByRoute, createBooking, addToFavorites, removeFromFavorites, getMyFavorites } from '../../services/api';

export default function CitizenTrips() {
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
    }, []);

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
            setError('Failed to load routes');
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
            setError('Failed to load trips');
        } finally {
            setLoadingTrips(false);
        }
    };

    const selectedRoute = routes.find(r => r.id === selectedRouteId);

    // ROUTE FILTER LOGIC
    const filteredRoutes = routes.filter(route => {
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
    });

    // TRIP FILTER LOGIC (after selecting a route)
    const filteredTrips = trips.filter(trip => {
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
    });

    const handleBook = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const trip = trips.find(t => t.id === bookingTripId);
            if (!trip) throw new Error('Trip not found');
            if (bookingSeatCount <= 0) {
                setError('Seat count must be at least 1.');
                return;
            }
            if (bookingSeatCount > trip.availableSeats) {
                setError('Not enough available seats.');
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
            await fetchTripsForRoute(selectedRouteId);

        } catch (err) {
            setError(err.response?.data?.Detailed || 'Booking failed');
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
            setError('Failed to update favorites');
        }
    };

    const statusColors = {
        Scheduled: 'text-blue-400 bg-blue-500/10',
        Started: 'text-emerald-400 bg-emerald-500/10',
        Delayed: 'text-yellow-400 bg-yellow-500/10',
        Finished: 'text-slate-400 bg-slate-500/10',
        Cancelled: 'text-red-400 bg-red-500/10'
    };

    if (loadingRoutes)
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">
                    {selectedRoute ? `Trips for: ${selectedRoute.name}` : 'Choose a Route'}
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
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm"
                    >
                        Change Route
                    </button>
                )}
            </div>

            {error && <div className="mb-4 text-red-400">{error}</div>}
            {success && <div className="mb-4 text-emerald-400">{success}</div>}

            {/* ROUTES LIST */}
            {!selectedRoute && (
                <>
                    {/* ROUTE SEARCH FILTERS */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Search route name"
                            value={routeFilters.name}
                            onChange={(e) =>
                                setRouteFilters({ ...routeFilters, name: e.target.value })
                            }
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                        />
                        <input
                            type="text"
                            placeholder="Start location"
                            value={routeFilters.startLocation}
                            onChange={(e) =>
                                setRouteFilters({ ...routeFilters, startLocation: e.target.value })
                            }
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                        />
                        <input
                            type="text"
                            placeholder="End location"
                            value={routeFilters.endLocation}
                            onChange={(e) =>
                                setRouteFilters({ ...routeFilters, endLocation: e.target.value })
                            }
                            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
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
                                className="text-left bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
                            >
                                <div className="font-semibold text-lg">{route.name}</div>
                                <div className="text-slate-400 text-sm mt-1">
                                    {route.startLocation} → {route.endLocation}
                                </div>
                            </button>
                        ))}

                        {filteredRoutes.length === 0 && (
                            <p className="text-center text-slate-500 py-10">
                                No routes match your search.
                            </p>
                        )}
                    </div>
                </>
            )}

            {/* TRIPS */}
            {selectedRoute && (
                <>
                    {/* TRIP FILTERS */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <select
                            value={tripFilters.status}
                            onChange={(e) => setTripFilters({ ...tripFilters, status: e.target.value })}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2"
                        >
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="started">Started</option>
                            <option value="delayed">Delayed</option>
                            <option value="finished">Finished</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Bus number"
                            value={tripFilters.busNumber}
                            onChange={(e) => setTripFilters({ ...tripFilters, busNumber: e.target.value })}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2"
                        />
                        <input
                            type="text"
                            placeholder="Departure date"
                            value={tripFilters.departureDate}
                            onChange={(e) => setTripFilters({ ...tripFilters, departureDate: e.target.value })}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2"
                        />
                        <input
                            type="number"
                            placeholder="Available seats"
                            value={tripFilters.availableSeats}
                            onChange={(e) => setTripFilters({ ...tripFilters, availableSeats: e.target.value })}
                            className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2"
                        />
                    </div>

                    <div className="grid gap-4">
                        {loadingTrips && (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {!loadingTrips && filteredTrips.map(trip => (
                            <div key={trip.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg">🚌 {trip.busNumber}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[trip.status] || ''}`}>
                                                {trip.status}
                                            </span>
                                        </div>
                                        <div className="text-slate-400 text-sm mt-2">
                                            <div>From: {selectedRoute.startLocation}</div>
                                            <div>To: {selectedRoute.endLocation}</div>
                                            <div className="mt-1">Departure: {new Date(trip.departureTime).toLocaleString()}</div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">💺 {trip.availableSeats}/{trip.totalSeats} available</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button onClick={() => toggleFavorite(trip.id)} className="text-2xl">
                                            {isFavorite(trip.id) ? '❤️' : '🤍'}
                                        </button>
                                        {trip.availableSeats > 0 && trip.status === 'Scheduled' && new Date(trip.departureTime) > new Date() && (
                                            <button onClick={() => { setBookingTripId(trip.id); setBookingSeatCount(1); setBookingName(''); }}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm">Reserve</button>
                                        )}
                                    </div>
                                </div>

                                {bookingTripId === trip.id && (
                                    <form onSubmit={handleBook} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <input placeholder="Your full name" value={bookingName} onChange={e => setBookingName(e.target.value)} required className="px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-sm"/>
                                        <input type="number" min={1} max={trip.availableSeats} value={bookingSeatCount} onChange={e => setBookingSeatCount(parseInt(e.target.value || '1', 10))} required className="px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-sm"/>
                                        <div className="flex gap-3">
                                            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm">Confirm</button>
                                            <button type="button" onClick={() => setBookingTripId(null)} className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm">Cancel</button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ))}

                        {!loadingTrips && filteredTrips.length === 0 && (
                            <p className="text-center text-slate-500 py-10">
                                {trips.length === 0 ? 'No trips available for this route.' : 'No trips match your filters.'}
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}