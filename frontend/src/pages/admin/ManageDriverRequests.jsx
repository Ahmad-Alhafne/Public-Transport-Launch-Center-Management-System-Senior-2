import { useEffect, useState } from 'react';
import { getAllChangeRequests, updateChangeRequestStatus } from '../../services/api';

export default function ManageDriverRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const typeLabels = {
        0: 'Phone Number',
        1: 'Password',
        2: 'Route Assignment',
        3: 'Profile Data'
    };

    const statusLabels = {
        0: 'Pending',
        1: 'Approved',
        2: 'Rejected'
    };

    const fetchRequests = async () => {
        try {
            const { data } = await getAllChangeRequests();
            setRequests(data);
        } catch {
            setError('Failed to load requests');
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
            setSuccess('Request approved.');
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.Detailed || 'Approval failed');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        setError('');
        setSuccess('');
        try {
            await updateChangeRequestStatus(id, { status: 2, adminNotes: reason });
            setSuccess('Request rejected.');
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.Detailed || 'Rejection failed');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    const pendingRequests = requests.filter(r => r.status === 0);
    const resolvedRequests = requests.filter(r => r.status !== 0);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Driver Change Requests</h1>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-yellow-400">Pending Requests ({pendingRequests.length})</h2>
                <div className="grid gap-4">
                    {pendingRequests.map(req => (
                        <div key={req.id} className="bg-slate-800/50 rounded-2xl p-6 border border-yellow-500/30">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="font-semibold">{typeLabels[req.type]}</p>
                                    <p className="text-sm text-slate-400">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400">Pending</span>
                            </div>
                            <div className="grid gap-2 text-sm mb-4">
                                <div>
                                    <span className="text-slate-400">Current:</span>
                                    <p className="text-white font-mono ml-2">{req.currentValue}</p>
                                </div>
                                <div>
                                    <span className="text-slate-400">Requested:</span>
                                    <p className="text-white font-mono ml-2">{req.requestedValue}</p>
                                </div>
                                {req.reason && (
                                    <div>
                                        <span className="text-slate-400">Reason:</span>
                                        <p className="text-white ml-2">{req.reason}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(req.id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                    {pendingRequests.length === 0 && (
                        <p className="text-center text-slate-500 py-10">No pending requests.</p>
                    )}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-slate-400">Resolved Requests ({resolvedRequests.length})</h2>
                <div className="grid gap-4">
                    {resolvedRequests.map(req => (
                        <div key={req.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="font-semibold">{typeLabels[req.type]}</p>
                                    <p className="text-sm text-slate-400">Resolved: {new Date(req.resolvedAt).toLocaleString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                    req.status === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                    {statusLabels[req.status]}
                                </span>
                            </div>
                            {req.adminNotes && (
                                <p className="text-sm text-slate-400">Admin Notes: {req.adminNotes}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
