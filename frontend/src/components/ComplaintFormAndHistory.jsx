import { useState, useEffect } from 'react';
import { getMyComplaints } from '../services/api';
import API_BASE from '../config';
import { useTranslation } from 'react-i18next';

const statusStyles = {
    Pending: 'bg-[var(--wheat-light)] text-[var(--wheat-dark)] border border-[rgba(185,167,121,0.25)]',
    InProgress: 'bg-[var(--forest-100)] text-[var(--forest-dark)] border border-[rgba(66,129,119,0.2)]',
    Resolved: 'bg-[rgba(66,129,119,0.12)] text-[var(--forest-deep)] border border-[rgba(66,129,119,0.25)]',
    Rejected: 'bg-[rgba(107,31,42,0.08)] text-[var(--umber-dark)] border border-[rgba(107,31,42,0.2)]'
};

const statusTextMap = {
    0: 'Pending',
    1: 'In Review',
    2: 'Resolved',
    3: 'Rejected',
    Pending: 'Pending',
    InProgress: 'In Progress',
    Resolved: 'Resolved',
    Rejected: 'Rejected'
};

function ComplaintCard({ complaint }) {
    const createdAt = new Date(complaint.createdAt).toLocaleString();
    const { t } = useTranslation();

    // Normalize status into one of the style keys: Pending, InProgress, Resolved, Rejected
    const numericToKey = { 0: 'Pending', 1: 'InProgress', 2: 'Resolved', 3: 'Rejected' };
    let statusKeyRaw = complaint.status;
    let statusKey;

    if (statusKeyRaw === undefined || statusKeyRaw === null) {
        statusKey = 'Pending';
    } else if (typeof statusKeyRaw === 'number') {
        statusKey = numericToKey[statusKeyRaw] || 'Pending';
    } else if (typeof statusKeyRaw === 'string') {
        // Prefer direct match, otherwise try to compact (remove spaces) to match keys like 'InProgress'
        if (statusStyles[statusKeyRaw]) statusKey = statusKeyRaw;
        else {
            const compact = statusKeyRaw.replace(/\s+/g, '');
            statusKey = statusStyles[compact] ? compact : statusKeyRaw;
        }
    } else {
        statusKey = 'Pending';
    }

    const translatedStatus = t(
        `generated.components_ComplaintFormAndHistory_status_${statusKey}`
    );

    const statusText =
        translatedStatus !==
        `generated.components_ComplaintFormAndHistory_status_${statusKey}`
            ? translatedStatus
            : (typeof complaint.status === 'number' ? statusTextMap[complaint.status] : statusTextMap[statusKey]) || statusKey;

    const statusClass = statusStyles[statusKey] || statusStyles.Pending;

    return (
        <div style={{padding:'10px', margin:'10px 0'}} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-5 hover:border-[var(--forest-light)] transition-all duration-300 shadow-sm">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-2 break-words">
                        {complaint.subject}
                    </h3>

                    <p className="text-[var(--text-muted)] leading-relaxed break-words text-sm">
                        {complaint.description}
                    </p>

                    <p className="text-xs text-[var(--text-muted)] opacity-75 mt-3">
                        {t('generated.components_ComplaintFormAndHistory_created')} {createdAt}
                    </p>
                </div>

                <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${statusClass}`}>
                    {statusText}
                </span>
            </div>

            {complaint.adminResponse ? (
                <div  className="mt-4 p-4 bg-[var(--background-subtle)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)]">
                    <p  className="text-xs uppercase tracking-wide text-[var(--forest)] font-semibold">
                        {t('generated.components_ComplaintFormAndHistory_jsx_39_05ec66f5')}
                    </p>

                    <p style={{marginTop:'10px'}} className="text-sm text-[var(--charcoal)] mt-2 leading-relaxed">
                        {complaint.adminResponse}
                    </p>
                </div>
            ) : (
                <div className="mt-4 p-4 bg-[var(--background-subtle)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] text-[var(--text-muted)] text-sm">
                    {t('generated.components_ComplaintFormAndHistory_no_admin_response')}
                </div>
            )}
        </div>
    );
}

export default function ComplaintFormAndHistory({ heading }) {
    const { t } = useTranslation();
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
            setError(err.response?.data?.Detailed || t('generated.components_ComplaintFormAndHistory_load_failed'));
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
                // Use fetch to avoid global axios interceptor auto-redirect on 401/403
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE}/complaint`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ subject, description }),
                });

                if (res.status === 401) {
                    setError(t('generated.components_ComplaintFormAndHistory_auth_required', 'Authentication required. Please login again.'));
                    setLoading(false);
                    return;
                }

                if (res.status === 403) {
                    setError(t('generated.components_ComplaintFormAndHistory_forbidden', 'You are not allowed to submit this complaint.'));
                    setLoading(false);
                    return;
                }

                if (!res.ok) {
                    const payload = await res.json().catch(() => ({}));
                    setError(payload.Detailed || t('generated.components_ComplaintFormAndHistory_submit_failed'));
                    setLoading(false);
                    return;
                }

                setSuccess(t('generated.components_ComplaintFormAndHistory_submit_success'));
                setSubject('');
                setDescription('');
                await fetchMyComplaints();
            } catch (err) {
                setError(t('generated.components_ComplaintFormAndHistory_submit_failed'));
            } finally {
                setLoading(false);
            }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[var(--charcoal)]" style={{margin:'20px 0'}}>
                    {heading || t('generated.components_ComplaintFormAndHistory_heading')}
                </h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error-border)] rounded-[var(--radius)] text-[var(--error)] text-sm font-medium">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-[var(--success-light)] border border-[var(--success-border)] rounded-[var(--radius)] text-[var(--success)] text-sm font-medium">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Complaint Form Card */}
                <div className="lg:col-span-2" >
                    <div style={{padding:'10px'}} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[var(--radius)] overflow-hidden shadow-sm">
                        <div style={{padding:'10px'}} className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--background-subtle)]">
                            <h2 className="text-lg font-semibold text-[var(--charcoal)]">
                                {t('generated.components_ComplaintFormAndHistory_submit_button')}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} style={{padding:'10px'}} className="p-6 space-y-5">
                            <div style={{padding:'10px'}}>
                                <label style={{padding:'10px'}} className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                    {t('generated.components_ComplaintFormAndHistory_jsx_104_8d183dbd')}
                                </label>
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                    className="input-field w-full text-sm"
                                />
                            </div>

                            <div style={{padding:'10px'}}> 
                                <label style={{padding:'10px'}} className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                                    {t('generated.components_ComplaintFormAndHistory_jsx_113_55f8ebc8')}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={6}
                                    required
                                    className="input-field w-full text-sm resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-[var(--forest)] hover:bg-[var(--forest-dark)] rounded-[var(--radius-sm)] font-semibold text-white transition-all duration-200 shadow-sm disabled:opacity-50"
                            >
                                {loading
                                    ? t('generated.components_ComplaintFormAndHistory_submitting')
                                    : t('generated.components_ComplaintFormAndHistory_submit_button')}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Complaint History Card */}
                <div className="lg:col-span-3">
                    <div style={{padding:'10px'}} className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-[var(--radius)] overflow-hidden shadow-sm">
                        <div style={{padding:'10px'}} className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--background-subtle)] flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-[var(--charcoal)]">
                                {t('generated.components_ComplaintFormAndHistory_jsx_133_da5b2c98')}
                            </h2>

                            <div className="flex items-center gap-3">
                                <span className="px-3 py-0.5 rounded-full bg-[var(--border-subtle)] text-xs font-semibold text-[var(--charcoal)]">
                                    {complaints.length}
                                </span>

                                <button
                                    onClick={fetchMyComplaints}
                                    className="text-xs px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--forest)] border border-[var(--border-subtle)] text-[var(--surface)] hover:bg-[var(--forest-dark)] font-medium transition shadow-sm"
                                >
                                    {t('common.refresh')}
                                </button>
                            </div>
                        </div>

                        <div className="p-6" style={{padding:'10px'}}>
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-20" style={{padding:'10px'}}>
                                    <div className="h-10 w-10 border-2 border-[var(--border-subtle)] border-t-[var(--forest)] rounded-full animate-spin" />
                                </div>
                            ) : complaints.length === 0 ? (
                                <div style={{padding:'10px'}} className="text-[var(--text-muted)] p-8 bg-[var(--background-subtle)] rounded-[var(--radius)] border border-[var(--border-subtle)] text-center font-medium">
                                    {t('generated.components_ComplaintFormAndHistory_jsx_145_ab3d309b')}
                                </div>
                            ) : (
                                <div className="space-y-4" style={{padding:'10px'}}>
                                    {complaints.map((complaint) => (
                                        <ComplaintCard
                                            key={complaint.id}
                                            complaint={complaint}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}