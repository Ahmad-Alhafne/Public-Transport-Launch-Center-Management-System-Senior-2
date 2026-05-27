import { useState, useEffect } from 'react';
import { getComplaints, respondToComplaint } from '../../services/api';

export default function ViewComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [respondModal, setRespondModal] = useState(null);
    const [respondData, setRespondData] = useState({ status: 1, adminResponse: '' });

    const fetchComplaints = async () => {
        try { const { data } = await getComplaints(); setComplaints(data); }
        catch { setError('Failed to load complaints'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleRespond = async () => {
        if (!respondModal) return;
        try { 
            await respondToComplaint(respondModal.id, respondData); 
            fetchComplaints();
            setRespondModal(null);
            setRespondData({ status: 1, adminResponse: '' });
        }
        catch (err) { setError(err.response?.data?.Detailed || 'Update failed'); }
    };

    const openRespondModal = (complaint) => {
        setRespondModal(complaint);
        setRespondData({ status: complaint.status, adminResponse: complaint.adminResponse || '' });
    };

    const statusMap = { 0: 'Pending', 1: 'InReview', 2: 'Resolved', 3: 'Rejected' };
    const statusColors = { Pending: 'text-yellow-400 bg-yellow-500/10', InReview: 'text-blue-400 bg-blue-500/10', Resolved: 'text-emerald-400 bg-emerald-500/10', Rejected: 'text-red-400 bg-red-500/10' };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Complaints</h1>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            <div className="grid gap-4">
                {complaints.map(c => (
                    <div key={c.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold">{c.subject}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[statusMap[c.status]] || ''}`}>{statusMap[c.status]}</span>
                                </div>
                                <p className="text-slate-400 text-sm mt-2">{c.description}</p>
                                {c.adminResponse && <p className="text-slate-300 text-sm mt-3 p-2 bg-slate-700/30 rounded">Admin response: {c.adminResponse}</p>}
                                <p className="text-xs text-slate-500 mt-2">By: {c.userName} ({c.userRole}) • {new Date(c.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => openRespondModal(c)} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs ml-4">Respond</button>
                        </div>
                    </div>
                ))}
                {complaints.length === 0 && <p className="text-center text-slate-500 py-10">No complaints found.</p>}
            </div>

            {/* Respond Modal */}
            {respondModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-slate-700">
                        <h2 className="text-xl font-bold mb-4">Respond to Complaint: {respondModal.subject}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Status</label>
                                <select 
                                    value={respondData.status} 
                                    onChange={(e) => setRespondData({ ...respondData, status: parseInt(e.target.value) })}
                                    className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                                >
                                    <option value={1}>InReview</option>
                                    <option value={2}>Resolved</option>
                                    <option value={3}>Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Admin Response</label>
                                <textarea 
                                    value={respondData.adminResponse} 
                                    onChange={(e) => setRespondData({ ...respondData, adminResponse: e.target.value })}
                                    placeholder="Enter your response..."
                                    className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 h-32"
                                />
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button 
                                    onClick={() => setRespondModal(null)}
                                    className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleRespond}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Send Response
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
