import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDrivers, getDriverProfile, createDriver, updateDriver, deleteDriver } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ManageDrivers() {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        // Driver profile fields
        licenseNumber: '',
        licenseExpiryDate: '',
        licenseCategory: '',
        issuingAuthority: '',
        vehiclePlateNumber: '',
        vehicleModel: '',
        vehicleColor: '',
        registrationExpiryDate: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [confirmingUpdate, setConfirmingUpdate] = useState(false);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

    const [filters, setFilters] = useState({
        fullName: '',
        email: '',
        vehiclePlateNumber: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleShowDetails = (id) => {
        navigate(`/admin/drivers/${id}`);
    };

    const fetchDrivers = async () => {
        try {
            const { data } = await getDrivers();
            setDrivers(data);
        } catch {
            setError('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters, drivers]);

    const resetForm = () => {
        setEditId(null);
        setForm({
            fullName: '',
            email: '',
            phoneNumber: '',
            password: '',
            licenseNumber: '',
            licenseExpiryDate: '',
            licenseCategory: '',
            issuingAuthority: '',
            vehiclePlateNumber: '',
            vehicleModel: '',
            vehicleColor: '',
            registrationExpiryDate: '',
        });
    };

    const buildPayload = () => ({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber || null,
        licenseNumber: form.licenseNumber || null,
        licenseExpiryDate: form.licenseExpiryDate || null,
        licenseCategory: form.licenseCategory || null,
        issuingAuthority: form.issuingAuthority || null,
        vehiclePlateNumber: form.vehiclePlateNumber || null,
        vehicleModel: form.vehicleModel || null,
        vehicleColor: form.vehicleColor || null,
        registrationExpiryDate: form.registrationExpiryDate || null,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (editId) {
            setConfirmingUpdate(true);
            return;
        }

        try {
            const payload = buildPayload();
            await createDriver({
                ...payload,
                email: form.email,
                password: form.password
            });
            setSuccess('Driver created successfully.');
            setShowForm(false);
            resetForm();
            fetchDrivers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Operation failed');
        }
    };

    const confirmUpdate = async () => {
        if (!editId) return;
        setConfirmingUpdate(false);
        setError('');
        setSuccess('');

        try {
            const payload = buildPayload();
            await updateDriver(editId, payload);
            setSuccess('Driver updated successfully.');
            setShowForm(false);
            resetForm();
            fetchDrivers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Operation failed');
        }
    };

    const handleEdit = async (driver) => {
        setError('');
        setSuccess('');
        setEditId(driver.id);

        let profile = {
            licenseNumber: '',
            licenseExpiryDate: '',
            licenseCategory: '',
            issuingAuthority: '',
            vehiclePlateNumber: '',
            vehicleModel: '',
            vehicleColor: '',
            registrationExpiryDate: ''
        };

        try {
            const { data } = await getDriverProfile(driver.id);
            profile = {
                licenseNumber: data.licenseNumber || '',
                licenseExpiryDate: data.licenseExpiryDate ? new Date(data.licenseExpiryDate).toISOString().slice(0, 10) : '',
                licenseCategory: data.licenseCategory || '',
                issuingAuthority: data.issuingAuthority || '',
                vehiclePlateNumber: data.vehiclePlateNumber || '',
                vehicleModel: data.vehicleModel || '',
                vehicleColor: data.vehicleColor || '',
                registrationExpiryDate: data.registrationExpiryDate ? new Date(data.registrationExpiryDate).toISOString().slice(0, 10) : ''
            };
        } catch (err) {
            // If profile doesn't exist yet, we still allow the admin to edit the user basic info.
            // The form will keep empty profile fields.
        }

        setForm({
            fullName: driver.fullName,
            email: driver.email,
            phoneNumber: driver.phoneNumber || '',
            password: '',
            ...profile
        });

        setShowForm(true);
    };

    const handleDelete = (id) => {
        setError('');
        setSuccess('');
        setConfirmingDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!confirmingDeleteId) return;
        const id = confirmingDeleteId;
        setConfirmingDeleteId(null);
        setError('');
        setSuccess('');

        try {
            await deleteDriver(id);
            setSuccess('Driver deleted successfully.');
            fetchDrivers();
        } catch (err) {
            setError(err.response?.data?.Detailed || err.response?.data || 'Delete failed');
        }
    };

    const filteredDrivers = drivers.filter((driver) => {
        const matchesName = filters.fullName
            ? (driver.fullName || '').toLowerCase().includes(filters.fullName.toLowerCase())
            : true;
        const matchesEmail = filters.email
            ? (driver.email || '').toLowerCase().includes(filters.email.toLowerCase())
            : true;
        const matchesPlate = filters.vehiclePlateNumber
            ? (driver.vehiclePlateNumber || '').toLowerCase().includes(filters.vehiclePlateNumber.toLowerCase())
            : true;

        return matchesName && matchesEmail && matchesPlate;
    });

    const pageCount = Math.max(1, Math.ceil(filteredDrivers.length / itemsPerPage));
    const paginatedDrivers = filteredDrivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        const newPageCount = Math.max(1, Math.ceil(filteredDrivers.length / itemsPerPage));
        if (currentPage > newPageCount) {
            setCurrentPage(newPageCount);
        }
    }, [currentPage, filteredDrivers.length, itemsPerPage]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Manage Drivers</h1>
                <button
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        }
                        setShowForm(!showForm);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm transition-colors"
                >
                    {showForm ? 'Cancel' : '+ New Driver'}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                    {success}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    placeholder="Search by name"
                    value={filters.fullName}
                    onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by email"
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <input
                    placeholder="Search by plate"
                    value={filters.vehiclePlateNumber}
                    onChange={(e) => setFilters({ ...filters, vehiclePlateNumber: e.target.value })}
                    className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <ConfirmationModal
                open={confirmingUpdate}
                title="Confirm Update"
                message="Are you sure you want to update this driver?"
                confirmText="Update"
                cancelText="Cancel"
                onConfirm={confirmUpdate}
                onCancel={() => setConfirmingUpdate(false)}
            />
            <ConfirmationModal
                open={!!confirmingDeleteId}
                title="Confirm Delete"
                message="Are you sure you want to delete this driver?"
                confirmText="Delete"
                cancelText="Cancel"
                danger
                onConfirm={confirmDelete}
                onCancel={() => setConfirmingDeleteId(null)}
            />

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <input
                        placeholder="Username"
                        value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                        required
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                        placeholder="Email"
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required={!editId}
                        disabled={!!editId}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-60"
                    />
                    <input
                        placeholder="Phone Number"
                        value={form.phoneNumber}
                        onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                        placeholder="License Number"
                        value={form.licenseNumber}
                        onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                        placeholder="Issuing Authority"
                        value={form.issuingAuthority}
                        onChange={e => setForm({ ...form, issuingAuthority: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                        placeholder="Vehicle Plate Number"
                        value={form.vehiclePlateNumber}
                        onChange={e => setForm({ ...form, vehiclePlateNumber: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                        placeholder="Vehicle Model"
                        value={form.vehicleModel}
                        onChange={e => setForm({ ...form, vehicleModel: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                        placeholder="Vehicle Color"
                        value={form.vehicleColor}
                        onChange={e => setForm({ ...form, vehicleColor: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <label className="block text-slate-400 text-xs">License Expiry Date</label>
                    <input
                        type="date"
                        value={form.licenseExpiryDate}
                        onChange={e => setForm({ ...form, licenseExpiryDate: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <label className="block text-slate-400 text-xs">Registration Expiry Date</label>
                    <input
                        type="date"
                        value={form.registrationExpiryDate}
                        onChange={e => setForm({ ...form, registrationExpiryDate: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <select
                        value={form.licenseCategory}
                        onChange={e => setForm({ ...form, licenseCategory: e.target.value })}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">License Category</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Car">Car</option>
                        <option value="Truck">Truck</option>
                        <option value="Bus">Bus</option>
                    </select>
                    {!editId && (
                        <input
                            placeholder="Initial Password"
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            className="px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        />
                    )}
                    <button
                        type="submit"
                        className="md:col-span-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-medium transition-colors"
                    >
                        {editId ? 'Update Driver' : 'Create Driver'}
                    </button>
                </form>
            )}

            <div className="grid gap-4">
                {paginatedDrivers.map(driver => (
                    <div
                        key={driver.id}
                        className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{driver.fullName}</h3>
                                <p className="text-slate-400 text-sm">{driver.email}</p>
                                {driver.phoneNumber && (
                                    <p className="text-slate-500 text-xs mt-1">📞 {driver.phoneNumber}</p>
                                )}
                                <p className="text-slate-500 text-xs mt-1">
                                    Joined {new Date(driver.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleShowDetails(driver.id)}
                                    className="px-3 py-1.5 bg-slate-600/20 text-slate-200 rounded-lg text-sm hover:bg-slate-600/30 transition-colors"
                                >
                                    Show Details
                                </button>
                                <button
                                    onClick={() => handleEdit(driver)}
                                    className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg text-sm hover:bg-blue-600/30 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(driver.id)}
                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredDrivers.length === 0 && (
                    <p className="text-center text-slate-500 py-10">No drivers found.</p>
                )}
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

