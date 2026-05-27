import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTripDetails } from '../../services/api';

export default function TripDetails() {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const statusLabels = {
        0: 'Scheduled',
        1: 'Started',
        2: 'Delayed',
        3: 'Finished',
        4: 'Cancelled'
    };

    const bookingStatusLabels = {
        0: 'Confirmed',
        1: 'Cancelled'
    };

    const fetchTripDetails = async () => {
        try {
            const { data } = await getTripDetails(tripId);
            setTrip(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load trip details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTripDetails(); }, [tripId]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    if (error) return <div className="text-center py-10 text-red-400">{error}</div>;

    if (!trip) return <div className="text-center py-10 text-red-400">Trip not found</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Trip Details</h1>

            {/* Trip Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Basic Info */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <h2 className="text-lg font-semibold mb-4 text-blue-400">Trip Information</h2>
                    <div className="grid gap-3">
                        <div>
                            <span className="text-slate-400 text-sm">Start Location:</span>
                            <p className="text-white">{trip.startLocation || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">End Location:</span>
                            <p className="text-white">{trip.endLocation || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Bus Number:</span>
                            <p className="text-white font-mono">{trip.busNumber}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Status:</span>
                            <p className="text-white">{statusLabels[trip.status] || 'Unknown'}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Departure:</span>
                            <p className="text-white">{new Date(trip.departureTime).toLocaleString()}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Arrival:</span>
                            <p className="text-white">{trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleString() : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Driver Info */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <h2 className="text-lg font-semibold mb-4 text-emerald-400">Driver Information</h2>
                    <div className="grid gap-3">
                        <div>
                            <span className="text-slate-400 text-sm">Driver Name:</span>
                            <p className="text-white">{trip.driverName}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Phone:</span>
                            <p className="text-white font-mono">{trip.driverPhone || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Driver ID:</span>
                            <p className="text-white font-mono text-xs break-all">{trip.driverId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat Usage */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-yellow-400">Seat Usage</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <span className="text-slate-400 text-sm">Total Seats:</span>
                        <p className="text-2xl font-bold text-white">{trip.seatUsage.totalSeats}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">Reserved:</span>
                        <p className="text-2xl font-bold text-emerald-400">{trip.seatUsage.reservedSeats}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">Available:</span>
                        <p className="text-2xl font-bold text-blue-400">{trip.seatUsage.availableSeats}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">Occupancy:</span>
                        <p className="text-2xl font-bold text-yellow-400">{trip.seatUsage.occupancyPercentage.toFixed(1)}%</p>
                    </div>
                </div>
                <div className="mt-4 w-full bg-slate-700/50 rounded-lg overflow-hidden h-2">
                    <div 
                        className="bg-gradient-to-r from-emerald-500 to-blue-500 h-full transition-all"
                        style={{ width: `${trip.seatUsage.occupancyPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Passengers */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold mb-4 text-purple-400">Passengers ({trip.passengers.length})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left py-3 px-4 text-slate-400">Passenger Name</th>
                                <th className="text-left py-3 px-4 text-slate-400">Phone</th>
                                <th className="text-center py-3 px-4 text-slate-400">Seats</th>
                                <th className="text-left py-3 px-4 text-slate-400">Booked At</th>
                                <th className="text-center py-3 px-4 text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trip.passengers.map((passenger) => (
                                <tr key={passenger.passengerId} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                                    <td className="py-3 px-4 text-white">{passenger.passengerName}</td>
                                    <td className="py-3 px-4 text-white font-mono text-xs">{passenger.passengerPhone || 'N/A'}</td>
                                    <td className="py-3 px-4 text-center text-white font-semibold">{passenger.seatCount}</td>
                                    <td className="py-3 px-4 text-slate-300">{new Date(passenger.bookedAt).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            passenger.status === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                        }`}>
                                            {bookingStatusLabels[passenger.status] || 'Unknown'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {trip.passengers.length === 0 && (
                    <p className="text-center text-slate-500 py-10">No confirmed bookings for this trip.</p>
                )}
            </div>
        </div>
    );
}
