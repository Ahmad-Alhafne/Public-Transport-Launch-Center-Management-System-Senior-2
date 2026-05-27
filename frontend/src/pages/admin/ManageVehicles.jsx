import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageVehicles() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', type: '', capacity: '', plateNumber: '', status: 'Active' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const [filters, setFilters] = useState({ name: '', type: '', plateNumber: '', status: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchVehicles = async () => {
        try {
            const { data } = await getVehicles();
            setVehicles(data);
        } catch {
            setError('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVehicles(); }, []);

    useEffect(() => { setCurrentPage(1); }, [filters, vehicles]);

    const buildPayload = () => ({
        name: form.name,
        type: form.type,
        capacity: parseInt(form.capacity, 10) || 0,
        plateNumber: form.plateNumber,
        status: form.status
    });

    const resetForm = () => {
        setEditId(null);
        setForm({ name: '', type: '', capacity: '', plateNumber: '', status: 'Active' });
    };

    const getErrorMessage = (err) => err?.response?.data?.Detailed || err?.response?.data?.detailed || err?.response?.data?.message || err.message || 'Operation failed';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');

        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            const payload = buildPayload();
            if (!payload.name || !payload.type || !payload.plateNumber || payload.capacity <= 0) {
                throw new Error('All fields are required, capacity must be greater than zero.');
            }
            await createVehicle(payload);
            setSuccess('Vehicle added successfully.');
            setShowForm(false);
            resetForm();
            fetchVehicles();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError(''); setSuccess('');

        try {
            const payload = buildPayload();
            await updateVehicle(editId, payload);
            setSuccess('Vehicle updated successfully.');
            setShowForm(false);
            resetForm();
            fetchVehicles();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleEdit = (vehicle) => {
        setEditId(vehicle.id);
        setForm({
            name: vehicle.name,
            type: vehicle.type,
            capacity: String(vehicle.capacity),
            plateNumber: vehicle.plateNumber,
            status: vehicle.status || 'Active'
        });
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

        try {
            await deleteVehicle(id);
            setSuccess('Vehicle deleted successfully.');
            fetchVehicles();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesName = filters.name ? (vehicle.name || '').toLowerCase().includes(filters.name.toLowerCase()) : true;
        const matchesType = filters.type ? (vehicle.type || '').toLowerCase().includes(filters.type.toLowerCase()) : true;
        const matchesPlate = filters.plateNumber ? (vehicle.plateNumber || '').toLowerCase().includes(filters.plateNumber.toLowerCase()) : true;
        const matchesStatus = filters.status ? (vehicle.status || '').toLowerCase().includes(filters.status.toLowerCase()) : true;
        return matchesName && matchesType && matchesPlate && matchesStatus;
    });

    const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage));
    const paginatedVehicles = filteredVehicles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredVehicles.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredVehicles.length, itemsPerPage]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Vehicles</h1>
                <button onClick={() => { setShowForm(!showForm); resetForm(); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm transition-colors">
                    {showForm ? 'Cancel' : '+ New Vehicle'}
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input placeholder="Search by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2" />
                <input placeholder="Search by type" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2" />
                <input placeholder="Search by plate" value={filters.plateNumber} onChange={(e) => setFilters({ ...filters, plateNumber: e.target.value })} className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2" />
                <input placeholder="Search by status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2" />
            </div>

            <ConfirmationModal open={confirmingUpdate} title="Confirm Update" message="Are you sure you want to update this vehicle?" confirmText="Update" cancelText="Cancel" onConfirm={confirmUpdate} onCancel={() => setConfirmingUpdate(false)} />
            <ConfirmationModal open={!!confirmingDeleteId} title="Confirm Delete" message="Are you sure you want to delete this vehicle?" confirmText="Delete" cancelText="Cancel" danger onConfirm={confirmDelete} onCancel={() => setConfirmingDeleteId(null)} />

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white" />
                    <input placeholder="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white" />
                    <input placeholder="Capacity" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white" />
                    <input placeholder="Plate Number" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required maxLength={50} className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white" />
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                    <button type="submit" className="md:col-span-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm transition-colors">{editId ? 'Update Vehicle' : 'Create Vehicle'}</button>
                </form>
            )}

            <div className="grid gap-4">
                {paginatedVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                                <p className="text-sm text-slate-400">{vehicle.type} • {vehicle.plateNumber}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/admin/vehicles/${vehicle.id}`)} className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 transition-colors">View Details</button>
                                <button onClick={() => handleEdit(vehicle)} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30">Edit</button>
                                <button onClick={() => handleDelete(vehicle.id)} className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredVehicles.length === 0 && <p className="text-center text-slate-500 py-10">No vehicles found.</p>}
            </div>

            {pageCount > 1 && (
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50">Previous</button>
                    {[...Array(pageCount)].map((_, index) => (
                        <button key={index} onClick={() => setCurrentPage(index + 1)} className={`px-3 py-1.5 rounded-lg text-sm ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-200 hover:bg-slate-700'}`}>
                            {index + 1}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))} disabled={currentPage === pageCount} className="px-3 py-1.5 bg-slate-700/50 text-slate-200 rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
}
