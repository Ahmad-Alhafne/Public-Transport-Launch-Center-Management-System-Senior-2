import { useState, useEffect } from 'react';
import { getMyActiveBookings, getMyBookingHistory, cancelBooking } from '../../services/api';

export default function MyBookings() {
    const [activeBookings, setActiveBookings] = useState([]);
    const [historyBookings, setHistoryBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [cancelCode, setCancelCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [filters, setFilters] = useState({
        bookedDate: '',
        departureDate: '',
        seatCount: ''
    });

    const fetchBookings = async () => {
        try {
            const [activeResponse, historyResponse] = await Promise.all([
                getMyActiveBookings(),
                getMyBookingHistory()
            ]);
            setActiveBookings(activeResponse.data);
            setHistoryBookings(historyResponse.data);
        } catch {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchBookings(); 
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchBookings, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCancel = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await cancelBooking({ cancellationCode: cancelCode });
            setSuccess('Booking cancelled successfully.');
            setCancelCode('');
            fetchBookings();
        } catch (err) { setError(err.response?.data?.Detailed || 'Cancellation failed'); }
    };

    const renderBookingCard = (booking, showCancellationCode = true) => {
        const tripStatus = booking.tripStatus || 'Unknown';
        const delayMinutes = booking.tripDelayMinutes ?? 0;
        const baseDeparture = new Date(booking.tripDepartureTimeUtc);
        const adjustedDeparture = new Date(baseDeparture.getTime() + delayMinutes * 60000);

        const statusColors = {
            Scheduled: 'text-blue-400 bg-blue-500/10',
            Started: 'text-emerald-400 bg-emerald-500/10',
            Delayed: 'text-yellow-400 bg-yellow-500/10',
            Finished: 'text-slate-400 bg-slate-500/10',
            Cancelled: 'text-red-400 bg-red-500/10'
        };

        return (
            <div key={booking.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-semibold">{booking.passengerName}</p>
                        <p className="text-sm text-slate-400 mt-1">Booked: {new Date(booking.bookedAt).toLocaleString()}</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Departure: {adjustedDeparture.toLocaleString()}
                            {delayMinutes > 0 && (
                                <span className="text-xs text-yellow-300 ml-2">(+{delayMinutes} min)</span>
                            )}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Seats: <span className="text-slate-300 font-mono">{booking.seatCount ?? 1}</span></p>
                        {showCancellationCode && (
                            <p className="text-xs text-slate-500 mt-1">Code: <span className="text-blue-400 font-mono">{booking.cancellationCode}</span></p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${booking.status === 'Confirmed' || booking.status === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {booking.status === 0 ? 'Confirmed' : booking.status === 1 ? 'Cancelled' : booking.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[tripStatus] || 'bg-slate-500/10 text-slate-300'}`}>
                            {tripStatus}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const currentBookings = activeTab === 'active' ? activeBookings : historyBookings;

    const filteredBookings = currentBookings.filter(booking => {
        const matchesBookedDate = !filters.bookedDate || new Date(booking.bookedAt).toLocaleDateString().includes(filters.bookedDate);
        const matchesDepartureDate = !filters.departureDate || new Date(booking.tripDepartureTimeUtc).toLocaleDateString().includes(filters.departureDate);
        const matchesSeatCount = !filters.seatCount || (booking.seatCount ?? 1).toString().includes(filters.seatCount);
        return matchesBookedDate && matchesDepartureDate && matchesSeatCount;
    });

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-slate-800/30 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                    Active Bookings ({activeBookings.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === 'history'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                    History ({historyBookings.length})
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    type="text"
                    placeholder="Filter by booked date"
                    value={filters.bookedDate}
                    onChange={(e) => setFilters({ ...filters, bookedDate: e.target.value })}
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
                    placeholder="Filter by seats"
                    value={filters.seatCount}
                    onChange={(e) => setFilters({ ...filters, seatCount: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Cancellation Form - Only for Active Bookings */}
            {activeTab === 'active' && (
                <form onSubmit={handleCancel} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 flex gap-3">
                    <input
                        placeholder="Enter cancellation code"
                        value={cancelCode}
                        onChange={e => setCancelCode(e.target.value)}
                        required
                        className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-medium transition-colors">
                        Cancel Booking
                    </button>
                </form>
            )}

            {/* Bookings List */}
            <div className="grid gap-4">
                {filteredBookings.map(booking => renderBookingCard(booking, activeTab === 'active'))}
                {filteredBookings.length === 0 && (
                    <p className="text-center text-slate-500 py-10">
                        {currentBookings.length === 0 
                            ? (activeTab === 'active' ? 'No active bookings found.' : 'No booking history found.')
                            : 'No bookings match your filters.'
                        }
                    </p>
                )}
            </div>
        </div>
    );
}
