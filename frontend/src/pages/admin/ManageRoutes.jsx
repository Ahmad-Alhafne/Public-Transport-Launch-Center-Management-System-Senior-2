import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoutes, createRoute, updateRoute, deleteRoute } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageRoutes() {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const [filters, setFilters] = useState({
        name: '',
        startLocation: '',
        endLocation: '',
        distanceKm: '',
        estimatedDurationMins: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchRoutes = async () => {
        try {
            const { data } = await getRoutes();
            setRoutes(data);
        } catch { setError('Failed to load routes'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchRoutes(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, routes]);

    const buildPayload = () => ({
        ...form,
        distanceKm: parseFloat(form.distanceKm),
        estimatedDurationMins: parseInt(form.estimatedDurationMins)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            const payload = buildPayload();
            await createRoute(payload);
            setSuccess('Route added successfully.');
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' });
            fetchRoutes();
        } catch (err) { setError(err.response?.data?.Detailed || 'Operation failed'); }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError(''); setSuccess('');

        try {
            const payload = buildPayload();
            await updateRoute(editId, { ...payload, isActive: true });
            setSuccess('Route updated successfully.');
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' });
            fetchRoutes();
        } catch (err) { setError(err.response?.data?.Detailed || 'Operation failed'); }
    };

    const handleEdit = (route) => {
        setEditId(route.id);
        setForm({ name: route.name, startLocation: route.startLocation, endLocation: route.endLocation, distanceKm: route.distanceKm, estimatedDurationMins: route.estimatedDurationMins });
        setShowForm(true);
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

        try { await deleteRoute(id); setSuccess('Route deleted successfully.'); fetchRoutes(); }
        catch (err) { setError(err.response?.data?.Detailed || 'Delete failed'); }
    };

    const filteredRoutes = routes.filter((route) => {
        const matchesName = filters.name
            ? (route.name || '').toLowerCase().includes(filters.name.toLowerCase())
            : true;
        const matchesStart = filters.startLocation
            ? (route.startLocation || '').toLowerCase().includes(filters.startLocation.toLowerCase())
            : true;
        const matchesEnd = filters.endLocation
            ? (route.endLocation || '').toLowerCase().includes(filters.endLocation.toLowerCase())
            : true;
        const matchesDistance = filters.distanceKm
            ? String(route.distanceKm).toLowerCase().includes(filters.distanceKm.toLowerCase())
            : true;
        const matchesDuration = filters.estimatedDurationMins
            ? String(route.estimatedDurationMins).toLowerCase().includes(filters.estimatedDurationMins.toLowerCase())
            : true;

        return matchesName && matchesStart && matchesEnd && matchesDistance && matchesDuration;
    });

    const pageCount = Math.max(1, Math.ceil(filteredRoutes.length / itemsPerPage));
    const paginatedRoutes = filteredRoutes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredRoutes.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredRoutes.length, itemsPerPage]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Routes</h1>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', startLocation: '', endLocation: '', distanceKm: '', estimatedDurationMins: '' }); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm transition-colors">
                    {showForm ? 'Cancel' : '+ New Route'}
                </button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
                <input
                    placeholder="Search by name"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by start"
                    value={filters.startLocation}
                    onChange={(e) => setFilters({ ...filters, startLocation: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by end"
                    value={filters.endLocation}
                    onChange={(e) => setFilters({ ...filters, endLocation: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by distance"
                    value={filters.distanceKm}
                    onChange={(e) => setFilters({ ...filters, distanceKm: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by duration"
                    value={filters.estimatedDurationMins}
                    onChange={(e) => setFilters({ ...filters, estimatedDurationMins: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <ConfirmationModal
                open={confirmingUpdate}
                title="Confirm Update"
                message="Are you sure you want to update this route?"
                confirmText="Update"
                cancelText="Cancel"
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
            <ConfirmationModal
                open={!!confirmingDeleteId}
                title="Confirm Delete"
                message="Are you sure you want to delete this route?"
                confirmText="Delete"
                cancelText="Cancel"
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Route Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input placeholder="Start Location" value={form.startLocation} onChange={e => setForm({ ...form, startLocation: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input placeholder="End Location" value={form.endLocation} onChange={e => setForm({ ...form, endLocation: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input placeholder="Distance (km)" type="number" step="0.1" value={form.distanceKm} onChange={e => setForm({ ...form, distanceKm: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <input placeholder="Duration (mins)" type="number" value={form.estimatedDurationMins} onChange={e => setForm({ ...form, estimatedDurationMins: e.target.value })} required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500" />
                    <button type="submit" className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors">
                        {editId ? 'Update' : 'Create'}
                    </button>
                </form>
            )}
            <div className="grid gap-4">
                {paginatedRoutes.map(route => (
                    <div key={route.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{route.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/admin/routes/${route.id}`)}
                                    className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                                >
                                    View Details
                                </button>
                                <button onClick={() => handleEdit(route)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors">Edit</button>
                                <button onClick={() => handleDelete(route.id)} className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors">Delete</button>
                            </div>
                        </div>

                        {expandedId === route.id && (
                            <div className="mt-3 text-sm text-slate-400">
                                <div><span className="text-slate-500">Start:</span> {route.startLocation}</div>
                                <div><span className="text-slate-500">Destination:</span> {route.endLocation}</div>
                                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                    <span>📏 {route.distanceKm} km</span>
                                    <span>⏱ {route.estimatedDurationMins} mins</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {filteredRoutes.length === 0 && <p className="text-center text-slate-500 py-10">No routes found.</p>}
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
