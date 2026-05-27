import { useState, useEffect } from 'react';
import { getMyChangeRequests, submitChangeRequest } from '../../services/api';

export default function DriverChangeRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 0, currentValue: '', requestedValue: '', reason: '' });
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
            const { data } = await getMyChangeRequests();
            setRequests(data);
        } catch {
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await submitChangeRequest({
                type: parseInt(form.type),
                currentValue: form.currentValue,
                requestedValue: form.requestedValue,
                reason: form.reason
            });
            setSuccess('Change request submitted successfully.');
            setForm({ type: 0, currentValue: '', requestedValue: '', reason: '' });
            setShowForm(false);
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.Detailed || 'Submission failed');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">My Change Requests</h1>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
                >
                    + New Change Request
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 grid gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Request Type</label>
                        <select
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="0">Phone Number</option>
                            <option value="1">Password</option>
                            <option value="2">Route Assignment</option>
                            <option value="3">Profile Data</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Current Value</label>
                        <input
                            type="text"
                            value={form.currentValue}
                            onChange={e => setForm({ ...form, currentValue: e.target.value })}
                            placeholder="Current value"
                            required
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Requested Value</label>
                        <input
                            type="text"
                            value={form.requestedValue}
                            onChange={e => setForm({ ...form, requestedValue: e.target.value })}
                            placeholder="New value you're requesting"
                            required
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Reason (Optional)</label>
                        <textarea
                            value={form.reason}
                            onChange={e => setForm({ ...form, reason: e.target.value })}
                            placeholder="Why are you requesting this change?"
                            rows="3"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors">Submit Request</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">Cancel</button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="font-semibold text-lg">{typeLabels[req.type]}</p>
                                <p className="text-sm text-slate-400">Submitted: {new Date(req.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                req.status === 0 ? 'bg-yellow-500/10 text-yellow-400' :
                                req.status === 1 ? 'bg-emerald-500/10 text-emerald-400' :
                                'bg-red-500/10 text-red-400'
                            }`}>
                                {statusLabels[req.status]}
                            </span>
                        </div>
                        <div className="grid gap-2 text-sm">
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
                            {req.adminNotes && (
                                <div>
                                    <span className="text-slate-400">Admin Notes:</span>
                                    <p className="text-white ml-2">{req.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {requests.length === 0 && (
                    <p className="text-center text-slate-500 py-10">No change requests yet.</p>
                )}
            </div>
        </div>
    );
}
