import { useState, useEffect } from 'react';
import { createComplaint, getMyComplaints } from '../services/api';

const statusStyles = {
  Pending: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  InProgress: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  Resolved: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  Rejected: 'bg-red-500/10 text-red-300 border border-red-500/20'
};

const statusTextMap = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Resolved: 'Resolved',
  Rejected: 'Rejected'
};

function ComplaintCard({ complaint }) {
  const createdAt = new Date(complaint.createdAt).toLocaleString();

  const statusKey = complaint.status || 'Pending';
  const statusText = statusTextMap[statusKey] || statusKey;
  const statusClass = statusStyles[statusKey] || statusStyles.Pending;

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
      <div className="flex flex-wrap justify-between gap-2 items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{complaint.subject}</h3>
          <p className="text-sm text-slate-300 mt-1">{complaint.description}</p>
          <p className="text-xs text-slate-400 mt-2">Created: {createdAt}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass}`}>
          {statusText}
        </span>
      </div>
      {complaint.adminResponse ? (
        <div className="mt-3 p-3 bg-gradient-to-r from-slate-900 to-slate-800 border border-blue-500/20 rounded-xl">
          <p className="text-xs uppercase tracking-wide text-blue-300 font-semibold">Admin Reply</p>
          <p className="text-sm text-slate-200 mt-1">{complaint.adminResponse}</p>
        </div>
      ) : (
        <div className="mt-3 p-3 bg-slate-900/70 border border-slate-600/50 rounded-xl text-slate-300 text-sm">
          No admin response yet.
        </div>
      )}
    </div>
  );
}

export default function ComplaintFormAndHistory({ heading = 'Submit Complaint' }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);

  const fetchMyComplaints = async () => {
    setHistoryLoading(true);
    setError('');
    try {
      const { data } = await getMyComplaints();
      setComplaints(data || []);
    } catch (err) {
      setError(err.response?.data?.Detailed || 'Failed to load complaints');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await createComplaint({ subject, description });
      setSuccess('Complaint submitted successfully.');
      setSubject('');
      setDescription('');
      await fetchMyComplaints();
    } catch (err) {
      setError(err.response?.data?.Detailed || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{heading}</h1>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">My Complaints</h2>
          <button
            onClick={fetchMyComplaints}
            className="text-xs px-2 py-1 rounded-md bg-slate-700/60 text-slate-200 hover:bg-slate-600 transition"
          >
            Refresh
          </button>
        </div>

        {historyLoading ? (
          <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
        ) : complaints.length === 0 ? (
          <div className="text-slate-300 p-4 bg-slate-800/50 rounded-xl border border-slate-700">You have not submitted any complaints yet.</div>
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}