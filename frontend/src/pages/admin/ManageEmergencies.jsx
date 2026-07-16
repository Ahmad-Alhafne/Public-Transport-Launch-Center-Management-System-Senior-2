import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getEmergencies, updateEmergencyStatus } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const emergencyTypes = ['Medical', 'Security', 'Mechanical', 'Fire', 'Other'];
const emergencyPriorities = ['Low', 'Medium', 'High', 'Critical'];
const emergencyStatuses = ['Reported', 'Acknowledged', 'InProgress', 'Escalated', 'Resolved', 'Cancelled'];

export default function ManageEmergencies() {
    const { t } = useTranslation();
    const [emergencies, setEmergencies] = useState([]);
    const [filters, setFilters] = useState({ type: '', priority: '', status: '', search: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [confirmation, setConfirmation] = useState({ open: false, id: null, status: '' });

    const fetchEmergencies = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await getEmergencies();
            setEmergencies(data);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.Detailed || t('admin.emergencies.loadError', 'Unable to load emergencies.'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchEmergencies();
    }, [fetchEmergencies]);

    const filteredEmergencies = emergencies.filter((emergency) => {
        const matchesType = filters.type ? emergency.type === filters.type : true;
        const matchesPriority = filters.priority ? emergency.priority === filters.priority : true;
        const matchesStatus = filters.status ? emergency.status === filters.status : true;
        const matchesSearch = filters.search
            ? [emergency.tripBusNumber, emergency.reporterRole, emergency.type, emergency.priority, emergency.status, emergency.description, emergency.tripId]
                .filter(Boolean)
                .join(' ').toLowerCase().includes(filters.search.toLowerCase())
            : true;
        return matchesType && matchesPriority && matchesStatus && matchesSearch;
    });

    const handleStatusUpdate = async (id, status) => {
        setError('');
        setSuccess('');

        try {
            await updateEmergencyStatus(id, { status });
            setSuccess(t('admin.emergencies.statusUpdated', 'Emergency status updated.'));
            setConfirmation({ open: false, id: null, status: '' });
            await fetchEmergencies();
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.Detailed || t('admin.emergencies.statusUpdateError', 'Unable to update the emergency status.'));
        }
    };

    const handleConfirmStatus = (id, status) => {
        setConfirmation({ open: true, id, status });
    };

    const confirmStatusChange = () => {
        if (confirmation.id && confirmation.status) {
            handleStatusUpdate(confirmation.id, confirmation.status);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--charcoal)', margin: '20px 0' }}>
                        {t('admin.emergencies.title', 'Emergency Management')}
                    </h1>
                    <p className="text-sm text-[var(--charcoal-medium)] max-w-2xl">
                        {t('admin.emergencies.subtitle', 'Review reported emergencies, escalate incidents, and update response status for critical trips.')}
                    </p>
                </div>
                <button
                    onClick={fetchEmergencies}
                    className="secondary-button px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200"
                    style={{ borderRadius: 'var(--radius-sm)' }}
                >
                    {t('admin.emergencies.refresh', 'Refresh')}
                </button>
            </div>

            {error && <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">{error}</div>}
            {success && <div className="alert alert-success mb-4 text-sm font-medium shadow-sm">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl border mb-6" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'rgba(66, 129, 119, 0.08)' }}>
                <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="input-field !bg-white"
                >
                    <option value="">{t('admin.emergencies.filterType', 'Filter by type')}</option>
                    {emergencyTypes.map((type) => (
                        <option key={type} value={type}>{t(`emergency.type.${type}`, type)}</option>
                    ))}
                </select>

                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="input-field !bg-white"
                >
                    <option value="">{t('admin.emergencies.filterPriority', 'Filter by priority')}</option>
                    {emergencyPriorities.map((priority) => (
                        <option key={priority} value={priority}>{t(`emergency.priority.${priority}`, priority)}</option>
                    ))}
                </select>

                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="input-field !bg-white"
                >
                    <option value="">{t('admin.emergencies.filterStatus', 'Filter by status')}</option>
                    {emergencyStatuses.map((status) => (
                        <option key={status} value={status}>{t(`emergency.status.${status}`, status)}</option>
                    ))}
                </select>

                <input
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder={t('admin.emergencies.searchPlaceholder', 'Search emergencies...')}
                    className="input-field !bg-white"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--forest)' }}></div>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-[rgba(66,129,119,0.08)] bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--surface-muted)] text-left text-xs uppercase tracking-wide text-[var(--charcoal-medium)]">
                                <th className="px-4 py-4">{t('admin.emergencies.table.trip', 'Trip')}</th>
                                <th className="px-4 py-4">{t('admin.emergencies.table.type', 'Type')}</th>
                                <th className="px-4 py-4">{t('admin.emergencies.table.priority', 'Priority')}</th>
                                <th className="px-4 py-4">{t('admin.emergencies.table.status', 'Status')}</th>
                                <th className="px-4 py-4">{t('admin.emergencies.table.reporter', 'Reporter')}</th>
                                <th className="px-4 py-4">{t('admin.emergencies.table.reportedAt', 'Reported At')}</th>
                                <th className="px-4 py-4">{t('admin.emergencies.table.actions', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(66,129,119,0.08)]">
                            {filteredEmergencies.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-10 text-center text-sm text-[var(--charcoal-medium)]">
                                        {t('admin.emergencies.noRecords', 'No emergencies found.')}
                                    </td>
                                </tr>
                            )}
                            {filteredEmergencies.map((emergency) => (
                                <tr key={emergency.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-semibold text-[var(--charcoal)]">{emergency.tripBusNumber || emergency.tripId}</div>
                                        <div className="text-xs text-[var(--charcoal-medium)] break-all">{emergency.tripId}</div>
                                        <Link className="text-[var(--forest)] text-xs font-semibold mt-1 inline-block" to={`/admin/trips/${emergency.tripId}`}>
                                            {t('admin.emergencies.viewTrip', 'View Trip')}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-4 align-top">{t(`emergency.type.${emergency.type}`, emergency.type)}</td>
                                    <td className="px-4 py-4 align-top">{t(`emergency.priority.${emergency.priority}`, emergency.priority)}</td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-full text-[var(--charcoal)] bg-[var(--surface-muted)] text-xs font-semibold">
                                                {t(`emergency.status.${emergency.status}`, emergency.status)}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-[var(--charcoal-medium)]">{emergency.updatedAt ? new Date(emergency.updatedAt).toLocaleString() : t('admin.emergencies.notUpdated', 'Not updated yet')}</div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="text-xs text-[var(--charcoal-medium)]">{emergency.reporterRole}</div>
                                        <div className="text-xs font-medium text-[var(--charcoal)]">{emergency.reporterId}</div>
                                    </td>
                                    <td className="px-4 py-4 align-top">{new Date(emergency.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-4 align-top">
                                        <select
                                            value={emergency.status}
                                            onChange={(e) => handleConfirmStatus(emergency.id, e.target.value)}
                                            className="input-field text-xs"
                                        >
                                            {emergencyStatuses.map((status) => (
                                                <option key={status} value={status}>{t(`emergency.status.${status}`, status)}</option>
                                            ))}
                                        </select>
                                        <div className="mt-2">
                                            <Link to={`/admin/trips/${emergency.tripId}`} className="text-xs text-[var(--forest)] hover:underline">
                                                {t('admin.emergencies.detailsLink', 'Trip details')}
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmationModal
                open={confirmation.open}
                title={t('admin.emergencies.confirmTitle', 'Confirm status update')}
                message={t('admin.emergencies.confirmMessage', 'Are you sure you want to update this emergency status?')}
                confirmText={t('common.update', 'Update')}
                cancelText={t('common.cancel', 'Cancel')}
                onConfirm={confirmStatusChange}
                onCancel={() => setConfirmation({ open: false, id: null, status: '' })}
            />
        </div>
    );
}
