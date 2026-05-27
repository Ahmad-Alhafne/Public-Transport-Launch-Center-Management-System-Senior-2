import { useState, useEffect, useCallback } from 'react';
import { updateTripStatus, getDriverTrips, getDriverTripHistory, getAdminContact } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ConfirmationModal from '../../components/ConfirmationModal';

const statusColors = {
    Scheduled: 'text-blue-400 bg-blue-500/10',
    Started: 'text-emerald-400 bg-emerald-500/10',
    Delayed: 'text-yellow-400 bg-yellow-500/10',
    Finished: 'text-slate-400 bg-slate-500/10',
    Cancelled: 'text-red-400 bg-red-500/10'
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
    setDelayTripId
}) {

    return (
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">

            <div className="flex items-center justify-between">

                <div>

                    <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">🚌 {trip.busNumber}</h3>

                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[trip.status] || ''}`}>
                            {trip.status}
                        </span>
                    </div>

                    <p className="text-slate-400 text-sm mt-1">
                        Departure: {new Date(trip.departureTime).toLocaleString()}
                    </p>

                    {trip.status === 'Delayed' && (
                        <p className="text-xs text-yellow-200 mt-1">
                            Delay: {trip.delayMinutes ?? 'N/A'} min.
                            {trip.delayReason && ` Reason: ${trip.delayReason}.`}
                            {trip.adminContact && ` Contact: ${trip.adminContact}`}
                        </p>
                    )}

                    <p className="text-xs text-slate-500 mt-1">
                        💺 {trip.availableSeats}/{trip.totalSeats} seats
                    </p>

                </div>

                {showActions && (
                    <div className="flex gap-2 flex-wrap">

                        <button
                            onClick={() => setConfirmingStart(trip.id)}
                            className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg text-xs hover:bg-emerald-600/30"
                        >
                            Start
                        </button>

                        <button
                            onClick={() => startDelay(trip.id)}
                            className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 rounded-lg text-xs hover:bg-yellow-600/30"
                        >
                            Delay
                        </button>

                        <button
                            onClick={() => setConfirmingFinish(trip.id)}
                            className="px-3 py-1.5 bg-slate-600/20 text-slate-400 rounded-lg text-xs hover:bg-slate-600/30"
                        >
                            Finish
                        </button>

                    </div>
                )}

            </div>

            {delayTripId === trip.id && (

                <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/40">

                    <h4 className="text-sm font-semibold text-slate-200 mb-2">
                        Delay details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                        <input
                            type="number"
                            min={1}
                            value={delayMinutes}
                            onChange={(e) => setDelayMinutes(parseInt(e.target.value || '0', 10))}
                            placeholder="Delay minutes"
                            className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                        />

                        <input
                            value={adminPhone}
                            readOnly
                            className="px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none text-sm"
                        />

                    </div>

                    <textarea
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        placeholder="Reason for delay"
                        className="mt-2 w-full px-3 py-2 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                    />

                    <div className="flex gap-2 mt-3">

                        <button
                            onClick={() => setConfirmingDelay(trip.id)}
                            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-xl text-sm"
                        >
                            Submit Delay
                        </button>

                        <button
                            onClick={() => setDelayTripId(null)}
                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm"
                        >
                            Cancel
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default function DriverTrips() {

    const { user } = useAuth();

    const [activeTrips, setActiveTrips] = useState([]);
    const [historyTrips, setHistoryTrips] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showHistory, setShowHistory] = useState(false);

    const [delayTripId, setDelayTripId] = useState(null);
    const [delayMinutes, setDelayMinutes] = useState(15);
    const [delayReason, setDelayReason] = useState('');

    const [adminContact, setAdminContact] = useState('');

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

            setError('Failed to load trips');

        } finally {

            setLoading(false);
        }

    }, [user.id]);

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

    const filteredActiveTrips = activeTrips.filter((trip) => {

        const matchesBus =
            filters.busNumber
                ? trip.busNumber.toLowerCase().includes(filters.busNumber.toLowerCase())
                : true;

        const matchesDeparture =
            filters.departureTime
                ? new Date(trip.departureTime).toLocaleDateString().includes(filters.departureTime)
                : true;

        const matchesSeats =
            filters.availableSeats
                ? trip.availableSeats.toString().includes(filters.availableSeats)
                : true;

        return matchesBus && matchesDeparture && matchesSeats;

    });

    const filteredHistoryTrips = historyTrips.filter((trip) => {

        const matchesBus =
            filters.busNumber
                ? trip.busNumber.toLowerCase().includes(filters.busNumber.toLowerCase())
                : true;

        const matchesDeparture =
            filters.departureTime
                ? new Date(trip.departureTime).toLocaleDateString().includes(filters.departureTime)
                : true;

        const matchesSeats =
            filters.availableSeats
                ? trip.availableSeats.toString().includes(filters.availableSeats)
                : true;

        return matchesBus && matchesDeparture && matchesSeats;

    });

    const handleStatusChange = async (id, status, payload = {}) => {

        try {

            await updateTripStatus(id, { status, ...payload });

            setError('');
            setDelayTripId(null);

            fetchTrips();

        } catch (err) {

            setError(err.response?.data?.Detailed || 'Update failed');

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

    if (loading)
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );

    return (

        <div>

            <h1 className="text-2xl font-bold mb-6">My Trips</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* FILTERS */}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">

                <input
                    placeholder="Search by bus number"
                    value={filters.busNumber}
                    onChange={(e) => setFilters({ ...filters, busNumber: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2"
                />

                <input
                    placeholder="Search by departure date"
                    value={filters.departureTime}
                    onChange={(e) => setFilters({ ...filters, departureTime: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2"
                />

                <input
                    placeholder="Search by available seats"
                    value={filters.availableSeats}
                    onChange={(e) => setFilters({ ...filters, availableSeats: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2"
                />

            </div>

            {/* ACTIVE TRIPS */}

            <div className="mb-8">

                <h2 className="text-xl font-semibold mb-4 text-emerald-400">
                    Active Trips
                </h2>

                <div className="grid gap-4">

                    {filteredActiveTrips
                        .filter(t => t.status !== 'Finished' && t.status !== 'Cancelled')
                        .map(trip => (

                            <TripCard
                                key={trip.id}
                                trip={trip}
                                showActions={true}
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
                            />

                        ))}

                </div>

            </div>

            {/* HISTORY */}

            <div className="mt-8">

                <div className="flex justify-between mb-4">

                    <h2 className="text-xl font-semibold text-slate-300">
                        Trip History (Last 7 Days)
                    </h2>

                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="px-4 py-2 bg-slate-700/50 rounded-lg text-sm"
                    >
                        {showHistory ? 'Hide History' : 'Show History'}
                    </button>
                     <ConfirmationModal
                        open={!!confirmingStart}
                        title="Confirm Start Trip"
                        message="Are you sure you want to start this trip?"
                        confirmText="Start"
                        cancelText="Cancel"
                        onConfirm={() => {
                            handleStatusChange(confirmingStart, 1);
                            setConfirmingStart(null);
                        }}
                        onCancel={() => setConfirmingStart(null)}
                    />

                    <ConfirmationModal
                        open={!!confirmingFinish}
                        title="Confirm Finish Trip"
                        message="Are you sure you want to finish this trip?"
                        confirmText="Finish"
                        cancelText="Cancel"
                        onConfirm={() => {
                            handleStatusChange(confirmingFinish, 3);
                            setConfirmingFinish(null);
                        }}
                        onCancel={() => setConfirmingFinish(null)}
                    />

                    <ConfirmationModal
                        open={!!confirmingDelay}
                        title="Confirm Submit Delay"
                        message="Are you sure you want to submit this delay?"
                        confirmText="Submit"
                        cancelText="Cancel"
                        onConfirm={() => {
                            submitDelay(confirmingDelay);
                            setConfirmingDelay(null);
                        }}
                        onCancel={() => setConfirmingDelay(null)}
                    />   
                </div>

                {showHistory && (

                    <div className="grid gap-4">

                        {filteredHistoryTrips.map(trip => (

                            <TripCard
                                key={trip.id}
                                trip={trip}
                                showActions={false}
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
                            />

                        ))}

                    </div>

                )}

            </div>

        </div>

    );
}