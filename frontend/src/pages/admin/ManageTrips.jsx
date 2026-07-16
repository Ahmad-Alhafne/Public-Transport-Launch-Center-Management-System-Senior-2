import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getTrips, createTrip, updateTrip, deleteTrip, getRoutes, getDrivers, getVehicles } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageTrips() {
    const { t } = useTranslation();
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

    const getErrorMessage = (err) => {
        const responseData = err?.response?.data;
        if (typeof responseData === 'string' && responseData.trim()) {
            return responseData;
        }
        return responseData?.Detailed || responseData?.detailed || responseData?.message || err.message || 'Operation failed';
    };

    const [filters, setFilters] = useState({
        busNumber: '',
        routeId: '',
        departureTime: '',
        availableSeats: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const selectedVehicle = vehicles.find((vehicle) => String(vehicle.id) === String(form.vehicleId));

    const fetchTrips = async () => {
        try { const { data } = await getTrips(); setTrips(data); }
        catch { setError(t('generated.pages_admin_ManageTrips_jsx_27_3742caa6')); }
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
            setError(`${t('generated.pages_admin_ManageTrips_jsx_16_0b5add5c')}: ${msg}`);

            if (err.response?.status === 401 || err.response?.status === 403) {
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
        routeId: form.routeId,
        driverId: form.driverId,
        vehicleId: form.vehicleId,
        busNumber: form.busNumber,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime || null,
        totalSeats: Number(form.totalSeats)
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
                throw new Error(t('generated.pages_admin_ManageTrips_jsx_84_b8bd0e76'));
            }
            const payload = buildPayload();
            await createTrip(payload);
            setSuccess(t('generated.pages_admin_ManageTrips_jsx_45_4e2bb92d'));
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
                throw new Error(t('generated.pages_admin_ManageTrips_jsx_84_b8bd0e76'));
            }
            const payload = buildPayload();
            await updateTrip(editId, payload);
            setSuccess(t('generated.pages_admin_ManageTrips_jsx_63_81c66823'));
            setShowForm(false);
            setEditId(null);
            setForm({ routeId: '', driverId: '', vehicleId: '', busNumber: '', departureTime: '', arrivalTime: '', totalSeats: '' });
            fetchTrips();
        } catch (err) { setError(getErrorMessage(err)); }
    };

    const handleDelete = (id) => {        
        setError(''); setSuccess('');
        setConfirmingDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmingDeleteId) return;
        const id = confirmingDeleteId;
        setConfirmingDeleteId(null);
        setError(''); setSuccess('');

        try { await deleteTrip(id); setSuccess(t('generated.pages_admin_ManageTrips_jsx_74_ac4c7b40')); fetchTrips(); }
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

    useEffect(() => {
        if (!form.vehicleId) return;

        const vehicle = vehicles.find((item) => String(item.id) === String(form.vehicleId));
        if (!vehicle) return;

        const vehicleCapacity = String(vehicle.capacity ?? '');
        if (vehicleCapacity !== form.totalSeats) {
            setForm((prev) => ({ ...prev, totalSeats: vehicleCapacity }));
        }
    }, [form.vehicleId, form.totalSeats, vehicles]);

    // Status mapping aligned dynamically to semantic theme states or clean fallback fills
    const statusColors = { 
        Scheduled: 'text-blue-600 bg-blue-50', 
        Started: 'text-emerald-700 bg-emerald-50', 
        Delayed: 'text-amber-700 bg-amber-50', 
        Finished: 'text-slate-600 bg-slate-100', 
        Cancelled: 'text-rose-700 bg-rose-50' 
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--forest)' }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Header Control Panel */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--charcoal)',margin:'20px 0' }}>
                        {t('admin.trips.title')}
                    </h1>
                </div>
                <button 
                    onClick={() => { setShowForm(!showForm); if (showForm) { setEditId(null); setForm({ routeId: '', driverId: '', vehicleId: '', busNumber: '', departureTime: '', arrivalTime: '', totalSeats: '' }); } }}
                    className={showForm ? "danger-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200" : "primary-button px-5 py-2.5 font-medium text-sm shadow-sm transition-all duration-200"}
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    {showForm ? t('common.cancel') : `+ ${t('admin.trips.newTrip')}`}
                </button>
            </div>

            {/* Notification Stack */}
            {error && <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">{error}</div>}
            {success && <div className="alert alert-success mb-4 text-sm font-medium shadow-sm">{success}</div>}

            {/* Filter Hub Matrix Grid */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                <input
                    placeholder={t('admin.trips.searchBusNumber')}
                    value={filters.busNumber}
                    onChange={(e) => setFilters({ ...filters, busNumber: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
                <input
                    placeholder={t('admin.trips.searchRouteId')}
                    value={filters.routeId}
                    onChange={(e) => setFilters({ ...filters, routeId: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
                <input
                    placeholder={t('admin.trips.searchDeparture')}
                    value={filters.departureTime}
                    onChange={(e) => setFilters({ ...filters, departureTime: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
                <input
                    placeholder={t('admin.trips.searchAvailableSeats')}
                    value={filters.availableSeats}
                    onChange={(e) => setFilters({ ...filters, availableSeats: e.target.value })}
                    className="input-field !bg-white focus:ring-2 focus:ring-offset-1"
                />
            </div>

            {/* Trigger Overlays */}
            <ConfirmationModal
                open={confirmingUpdate}
                title={t('admin.trips.confirmUpdateTitle')}
                message={t('admin.trips.confirmUpdateMessage')}
                confirmText={t('common.update')}
                cancelText={t('common.cancel')}
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
            <ConfirmationModal
                open={!!confirmingDeleteId}
                title={t('admin.trips.confirmDeleteTitle')}
                message={t('admin.trips.confirmDeleteMessage')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />

            {/* Input Upsert Entity Deck Form */}
            {showForm && (
                <div className="card mb-8 p-6 transition-all duration-300" style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(66, 129, 119, 0.12)' }}>
                    <h2 className="text-xl font-bold mb-6 pb-2 border-b" style={{ color: 'var(--forest-dark)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                        {editId ? t('admin.trips.updateTrip') : t('admin.trips.createTrip')}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.trips.selectRoute')}</span>
                            <select value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value })} required className="input-field">
                                <option value="" disabled>{t('admin.trips.selectRoute')}</option>
                                {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.trips.selectDriver')}</span>
                            <select value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} required className="input-field">
                                <option value="" disabled>{t('admin.trips.selectDriver')}</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.trips.selectVehicle')}</span>
                            <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} required className="input-field">
                                <option value="" disabled>{vehicles.length ? t('admin.trips.selectVehicle') : t('admin.trips.noVehiclesAvailable')}</option>
                                {vehicles.length === 0 && <option value="" disabled>{t('admin.trips.noVehiclesAvailable')}</option>}
                                {vehicles.map(v => <option key={v.id} value={v.id}>{`${v.name} (${v.plateNumber}) - ${v.capacity} ${t('common.seats')}`}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.trips.busNumber')}</span>
                            <input placeholder={t('admin.trips.busNumber')} value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} required className="input-field" />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.trips.departureTime')}</span>
                            <input type="datetime-local" value={form.departureTime} onChange={e => setForm({ ...form, departureTime: e.target.value })} required className="input-field" />
                        </label>

                        <label className="flex flex-col gap-1.5">
                            <span className="form-label !mb-0">{t('admin.trips.arrivalTime')}</span>
                            <input type="datetime-local" value={form.arrivalTime} onChange={e => setForm({ ...form, arrivalTime: e.target.value })} className="input-field" />
                        </label>

                        <label className="flex flex-col gap-1.5 md:col-span-2">
                            <span className="form-label !mb-0">{t('admin.trips.totalSeats')}</span>
                            <input
                                type="number"
                                value={form.totalSeats}
                                readOnly
                                required
                                className="input-field bg-[var(--surface-muted)] cursor-not-allowed"
                                placeholder={t('admin.trips.selectVehicle')}
                            />
                            <span className="text-xs text-muted">
                                {selectedVehicle
                                    ? `${t('admin.trips.totalSeats')}: ${selectedVehicle.capacity}`
                                    : t('admin.trips.selectVehicle')}
                            </span>
                        </label>

                        <div className="md:col-span-2 pt-2">
                            <button type="submit" className="primary-button w-full py-3 text-sm font-semibold shadow-sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                                {editId ? t('admin.trips.updateTrip') : t('admin.trips.createTrip')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Array Render Cards */}
            <div className="grid gap-4">
                {paginatedTrips.map(trip => (
                    <div 
                        key={trip.id} 
                        className="card p-5 transition-all duration-200"
                        style={{ 
                            backgroundColor: 'var(--surface)', 
                            borderColor: 'rgba(66, 129, 119, 0.08)',
                            borderRadius: 'var(--radius)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(66, 129, 119, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(66, 129, 119, 0.08)'}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="cursor-pointer flex-1 space-y-1.5" onClick={() => setExpandedId(expandedId === trip.id ? null : trip.id)}>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>
                                        🚌 {trip.busNumber}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm ${statusColors[trip.status] || 'text-slate-600 bg-slate-100'}`}>
                                        {trip.status}
                                    </span>
                                </div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                    Route Identification: <span className="font-mono text-xs font-semibold">{trip.routeId}</span>
                                </p>
                            </div>

                            {/* Action Operations Link Stack */}
                            <div className="flex flex-wrap gap-2 sm:self-center">
                                <button
                                    onClick={() => navigate(`/admin/trips/${trip.id}`)}
                                    className="outline-button px-3.5 py-1.5 text-sm font-medium"
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    {t('common.showDetails')}
                                </button>
                                <button
                                    onClick={() => { setEditId(trip.id); setForm({ routeId: trip.routeId, driverId: trip.driverId, vehicleId: trip.vehicleId || '', busNumber: trip.busNumber, departureTime: trip.departureTime?.slice(0, 16), arrivalTime: trip.arrivalTime?.slice(0, 16) || '', totalSeats: String(trip.totalSeats) }); setShowForm(true); }}
                                    className="px-3.5 py-1.5 text-sm font-medium transition-colors"
                                    style={{ 
                                        backgroundColor: 'rgba(66, 129, 119, 0.12)', 
                                        color: 'var(--forest-dark)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 129, 119, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 129, 119, 0.12)'}
                                >
                                    {t('common.update')}
                                </button>
                                <button 
                                    onClick={() => handleDelete(trip.id)} 
                                    className="px-3.5 py-1.5 text-sm font-medium transition-colors"
                                    style={{ 
                                        backgroundColor: 'rgba(107, 31, 42, 0.08)', 
                                        color: 'var(--umber)',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 31, 42, 0.14)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(107, 31, 42, 0.08)'}
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Expansion Section Drawer */}
                        {expandedId === trip.id && (
                            <div className="mt-4 pt-4 text-sm border-t space-y-2" style={{ borderColor: 'rgba(66, 129, 119, 0.06)' }}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                                    <div>
                                        <span style={{ color: 'var(--charcoal-medium)' }}>{t('generated.pages_admin_ManageTrips_jsx_132_27e3fc5a')}:</span>{' '}
                                        <span style={{ color: 'var(--charcoal)' }}>{new Date(trip.departureTime).toLocaleString()}</span>
                                    </div>
                                    {trip.arrivalTime && (
                                        <div>
                                            <span style={{ color: 'var(--charcoal-medium)' }}>{t('generated.pages_admin_ManageTrips_jsx_134_56d2b247')}:</span>{' '}
                                            <span style={{ color: 'var(--charcoal)' }}>{new Date(trip.arrivalTime).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                                    <span className="flex items-center gap-1">💺 {trip.availableSeats} / {trip.totalSeats} {t('common.seats')}</span>
                                    <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{t('generated.pages_admin_ManageTrips_jsx_139_9362d2db')}: {trip.routeId}</span>
                                    <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{t('generated.pages_admin_ManageTrips_jsx_141_1496d165')}: {trip.driverId}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {filteredTrips.length === 0 && (
                    <div className="text-center py-12 card" style={{ backgroundColor: 'var(--surface)' }}>
                        <p className="text-base font-medium" style={{ color: 'var(--charcoal-medium)' }}>
                            {t('generated.pages_admin_ManageTrips_jsx_126_c073b1fd')}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination Grid Navigation Footer */}
            {pageCount > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3.5 py-1.5 font-medium rounded-lg text-sm transition-all duration-200 disabled:opacity-40"
                        style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--charcoal-medium)' }}
                    >
                        {t('common.previous')}
                    </button>
                    {[...Array(pageCount)].map((_, index) => {
                        const page = index + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                                style={currentPage === page ? {
                                    backgroundColor: 'var(--forest)',
                                    color: 'var(--surface)',
                                    boxShadow: '0 4px 12px rgba(66, 129, 119, 0.15)'
                                } : {
                                    backgroundColor: 'var(--surface-muted)',
                                    color: 'var(--charcoal-medium)'
                                }}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                        disabled={currentPage === pageCount}
                        className="px-3.5 py-1.5 font-medium rounded-lg text-sm transition-all duration-200 disabled:opacity-40"
                        style={{ backgroundColor: 'var(--surface-muted)', color: 'var(--charcoal-medium)' }}
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </div>
    );
}