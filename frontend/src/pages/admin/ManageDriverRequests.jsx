import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllChangeRequests, updateChangeRequestStatus } from '../../services/api';

export default function ManageDriverRequests() {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const typeLabels = {
        0: t('admin.driverRequests.phoneNumber'),
        1: t('admin.driverRequests.password'),
        2: t('admin.driverRequests.routeAssignment'),
        3: t('admin.driverRequests.profileData')
    };

    const statusLabels = {
        0: t('admin.driverRequests.pending'),
        1: t('admin.driverRequests.approved'),
        2: t('admin.driverRequests.rejected')
    };

    const fetchRequests = async () => {
        try {
            const { data } = await getAllChangeRequests();
            setRequests(data);
        } catch {
            setError(t('admin.driverRequests.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleApprove = async (id) => {
        setError('');
        setSuccess('');
        try {
            await updateChangeRequestStatus(id, { status: 1, adminNotes: 'Approved' });
            setSuccess(t('admin.driverRequests.requestApproved'));
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.Detailed || t('admin.driverRequests.approvalFailed'));
        }
    };

    const handleReject = async (id) => {
        const reason = prompt(t('admin.driverRequests.enterRejectionReason'));
        if (!reason) return;
        setError('');
        setSuccess('');
        try {
            await updateChangeRequestStatus(id, { status: 2, adminNotes: reason });
            setSuccess(t('admin.driverRequests.requestRejected'));
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.Detailed || t('admin.driverRequests.rejectionFailed'));
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const pendingRequests = requests.filter(r => r.status === 0);
    const resolvedRequests = requests.filter(r => r.status !== 0);

    return (
        <div>
            <h1 style={{margin:'20px 0'}} className="text-2xl font-bold mb-6">{t('admin.driverRequests.title')}</h1>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-yellow-400">{t('admin.driverRequests.pendingRequests')} ({pendingRequests.length})</h2>
                <div className="grid gap-4">
                    {pendingRequests.map(req => (
                        <div key={req.id} className="bg-slate-800/50 rounded-2xl p-6 border border-yellow-500/30">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="font-semibold">{typeLabels[req.type]}</p>
                                    <p className="text-sm text-slate-400">{t('admin.driverRequests.submitted')}: {new Date(req.createdAt).toLocaleString()}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400">{t('admin.driverRequests.pending')}</span>
                            </div>
                            <div className="grid gap-2 text-sm mb-4">
                                <div>
                                    <span className="text-slate-400">{t('admin.driverRequests.current')}:</span>
                                    <p className="text-white font-mono ml-2">{req.currentValue}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">{t('admin.driverRequests.requested')}:</span>
                                    <p className="text-white font-mono ml-2">{req.requestedValue}</p>
                                </div>
                                {req.reason && (
                                    <div>
                                        <span className="text-slate-400">{t('admin.driverRequests.reason')}:</span>
                                        <p className="text-white ml-2">{req.reason}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {t('admin.driverRequests.approve')}
                                </button>
                                <button
                                    onClick={() => handleReject(req.id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {t('admin.driverRequests.reject')}
                                </button>
                            </div>
                        </div>
                    ))}
                    {pendingRequests.length === 0 && (
                        <p className="text-center text-slate-500 py-10">{t('admin.driverRequests.noPendingRequests')}</p>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-slate-400">{t('admin.driverRequests.resolvedRequests')} ({resolvedRequests.length})</h2>
                <div className="grid gap-4">
                    {resolvedRequests.map(req => (
                        <div key={req.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="font-semibold">{typeLabels[req.type]}</p>
                                    <p className="text-sm text-slate-400">{t('admin.driverRequests.resolvedLabel')}: {new Date(req.resolvedAt).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                    req.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                    {statusLabels[req.status]}
                                </span>
                            </div>
                            {req.adminNotes && (
                                <p className="text-sm text-slate-400">{t('admin.driverRequests.adminNotes')}: {req.adminNotes}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
