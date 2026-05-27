import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrips, createTrip, updateTrip, deleteTrip, getRoutes, getDrivers, getVehicles } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageTrips() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ routeId: '', driverId: '', vehicleId: '', busNumber: '', departureTime: '', arrivalTime: '', totalSeats: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const getErrorMessage = (err) => err?.response?.data?.Detailed || err?.response?.data?.detailed || err?.response?.data?.message || err.message || 'Operation failed';

    const [filters, setFilters] = useState({
        busNumber: '',
        routeId: '',
        departureTime: '',
        availableSeats: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchTrips = async () => {
        try { const { data } = await getTrips(); setTrips(data); }
        catch { setError('Failed to load trips'); }
        finally { setLoading(false); }
    };

    const fetchLookups = async () => {
        try {
            const [{ data: routesData }, { data: driversData }, { data: vehiclesData }] = await Promise.all([getRoutes(), getDrivers(), getVehicles()]);
            setRoutes(routesData);
            setDrivers(driversData);
            setVehicles(vehiclesData);
        } catch (err) {
            const msg = getErrorMessage(err);
            setError(`Lookup load failed: ${msg}`);

            if (err.response?.status === 401 || err.response?.status === 403) {
                // If unauthorized, invalidate session and redirect to login.
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    };

    useEffect(() => { fetchTrips(); fetchLookups(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, trips]);

    const buildPayload = () => ({
        ...form,
        routeId: form.routeId,
        driverId: form.driverId,
        vehicleId: form.vehicleId,
        busNumber: form.busNumber,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        totalSeats: parseInt(form.totalSeats, 10)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            if (!form.vehicleId) {
                throw new Error('Vehicle selection is required.');
            }
            const payload = buildPayload();
            await createTrip(payload);
            setSuccess('Trip added successfully.');
            setShowForm(false);
            setEditId(null);
            setForm({ routeId: '', driverId: '', vehicleId: '', busNumber: '', departureTime: '', arrivalTime: '', totalSeats: '' });
            fetchTrips();
        } catch (err) { setError(getErrorMessage(err)); }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError(''); setSuccess('');

        try {
            if (!form.vehicleId) {
                throw new Error('Vehicle selection is required.');
            }
            const payload = buildPayload();
            await updateTrip(editId, payload);
            setSuccess('Trip updated successfully.');
            setShowForm(false);
            setEditId(null);
            setForm({ routeId: '', driverId: '', vehicleId: '', busNumber: '', departureTime: '', arrivalTime: '', totalSeats: '' });
            fetchTrips();
        } catch (err) { setError(getErrorMessage(err)); }
    };

    const handleDelete = (id) => {        setError(''); setSuccess('');
        setConfirmingDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmingDeleteId) return;
        const id = confirmingDeleteId;
        setConfirmingDeleteId(null);
        setError(''); setSuccess('');

        try { await deleteTrip(id); setSuccess('Trip deleted successfully.'); fetchTrips(); }
         catch (err) { setError(getErrorMessage(err)); }
    };

    const filteredTrips = trips.filter((trip) => {
        const matchesBus = filters.busNumber
            ? (trip.busNumber || '').toLowerCase().includes(filters.busNumber.toLowerCase())
            : true;
        const matchesRoute = filters.routeId
            ? (trip.routeId || '').toString().toLowerCase().includes(filters.routeId.toLowerCase())
            : true;
        const matchesDeparture = filters.departureTime
            ? (trip.departureTime || '').toLowerCase().includes(filters.departureTime.toLowerCase())
            : true;
        const matchesAvailableSeats = filters.availableSeats
            ? (trip.availableSeats || '').toString().toLowerCase().includes(filters.availableSeats.toLowerCase())
            : true;

        return matchesBus && matchesRoute && matchesDeparture && matchesAvailableSeats;
    });

    const pageCount = Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));
    const paginatedTrips = filteredTrips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredTrips.length, itemsPerPage]);

    const statusColors = { Scheduled: 'text-blue-400 bg-blue-500/10', Started: 'text-emerald-400 bg-emerald-500/10', Delayed: 'text-yellow-400 bg-yellow-500/10', Finished: 'text-slate-400 bg-slate-500/10', Cancelled: 'text-red-400 bg-red-500/10' };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Trips</h1>
                <button onClick={() => { setShowForm(!showForm); if (showForm) { setEditId(null); setForm({ routeId: '', driverId: '', busNumber: '', departureTime: '', arrivalTime: '', totalSeats: '' }); } }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm transition-colors">
                    {showForm ? 'Cancel' : '+ New Trip'}
                </button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    placeholder="Search by bus number"
                    value={filters.busNumber}
                    onChange={(e) => setFilters({ ...filters, busNumber: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by route ID"
                    value={filters.routeId}
                    onChange={(e) => setFilters({ ...filters, routeId: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by departure"
                    value={filters.departureTime}
                    onChange={(e) => setFilters({ ...filters, departureTime: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by available seats"
                    value={filters.availableSeats}
                    onChange={(e) => setFilters({ ...filters, availableSeats: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <ConfirmationModal
                open={confirmingUpdate}
                title="Confirm Update"
                message="Are you sure you want to update this trip?"
                confirmText="Update"
                cancelText="Cancel"
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
            <ConfirmationModal
                open={!!confirmingDeleteId}
                title="Confirm Delete"
                message="Are you sure you want to delete this trip?"
                confirmText="Delete"
                cancelText="Cancel"
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500">
                        <option value="" disabled>Select Route</option>
                        {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <select value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500">
                        <option value="" disabled>Select Driver</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                    </select>
                    <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500">
                        <option value="" disabled>{vehicles.length ? 'Select Vehicle' : 'No vehicles available'}</option>
                        {vehicles.length === 0 && <option value="" disabled>No vehicles found</option>}
                        {vehicles.map(v => <option key={v.id} value={v.id}>{`${v.name} (${v.plateNumber})`}</option>)}
                    </select>
                    <input placeholder="Bus Number" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input placeholder="Departure Time" type="datetime-local" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input placeholder="Arrival Time" type="datetime-local" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input placeholder="Total Seats" type="number" value={form.totalSeats} onChange={e => setForm({ ...form, totalSeats: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <button type="submit" className="md:col-span-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors">
                        {editId ? 'Update Trip' : 'Create Trip'}
                    </button>
                </form>
            )}
            <div className="grid gap-4">
                {paginatedTrips.map(trip => (
                    <div key={trip.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">🚌 {trip.busNumber}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[trip.status] || 'text-slate-400'}`}>{trip.status}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/admin/trips/${trip.id}`)}
                                    className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-sm hover:bg-purple-600/30 transition-colors"
                                >
                                    View Full Details
                                </button>
                                <button
                                    onClick={() => { setEditId(trip.id); setForm({ routeId: trip.routeId, driverId: trip.driverId, vehicleId: trip.vehicleId || '', busNumber: trip.busNumber, departureTime: trip.departureTime?.slice(0, 16), arrivalTime: trip.arrivalTime?.slice(0, 16) || '', totalSeats: String(trip.totalSeats) }); setShowForm(true); }}
                                    className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
                                >
                                    Update
                                </button>
                                <button onClick={() => handleDelete(trip.id)} className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors">Delete</button>
                            </div>
                        </div>

                        {expandedId === trip.id && (
                            <div className="mt-3 text-sm text-slate-400">
                                <div><span className="text-slate-500">Departure:</span> {new Date(trip.departureTime).toLocaleString()}</div>
                                {trip.arrivalTime && <div><span className="text-slate-500">Arrival:</span> {new Date(trip.arrivalTime).toLocaleString()}</div>}
                                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                    <span>💺 {trip.availableSeats}/{trip.totalSeats} seats</span>
                                    <span className="font-mono">Route: {trip.routeId}</span>
                                    <span className="font-mono">Driver: {trip.driverId}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {filteredTrips.length === 0 && <p className="text-center text-slate-500 py-10">No trips found.</p>}
            </div>

            {pageCount > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {[...Array(pageCount)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700'}`}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                        disabled={currentPage === pageCount}
                        className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
