import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getComplaints, respondToComplaint } from '../../services/api';

export default function ViewComplaints() {
    const { t } = useTranslation();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [respondModal, setRespondModal] = useState(null);
    const [respondData, setRespondData] = useState({ status: 1, adminResponse: '' });

    const fetchComplaints = async () => {
        try { const { data } = await getComplaints(); setComplaints(data); }
        catch { setError(t('components_ComplaintFormAndHistory_load_failed')); }
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
        catch (err) { setError(err.response?.data?.Detailed || t('generated.pages_admin_ViewComplaints_update_failed')); }
    };

    const openRespondModal = (complaint) => {
        setRespondModal(complaint);
        setRespondData({ status: complaint.status, adminResponse: complaint.adminResponse || '' });
    };

    const statusMap = { 0: t('admin.complaints.pending'), 1: t('admin.complaints.inReview'), 2: t('admin.complaints.resolved'), 3: t('admin.complaints.rejected') };
    
    // Status colors mapped cleanly into uniform system badge classes
    const statusColors = { 
        [t('admin.complaints.pending')]: 'text-amber-700 bg-amber-50', 
        [t('admin.complaints.inReview')]: 'text-blue-600 bg-blue-50', 
        [t('admin.complaints.resolved')]: 'text-emerald-700 bg-emerald-50', 
        [t('admin.complaints.rejected')]: 'text-rose-700 bg-rose-50' 
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--forest)' }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold tracking-tight mb-6" style={{ color: 'var(--charcoal)' }}>
                {t('admin.complaints.title')}
            </h1>

            {error && <div className="alert alert-error mb-4 text-sm font-medium shadow-sm">{error}</div>}

            <div className="grid gap-4">
                {complaints.map(c => (
                    <div 
                        key={c.id} 
                        className="card p-6 border transition-all duration-200" 
                        style={{ 
                            backgroundColor: 'var(--surface)', 
                            borderColor: 'rgba(66, 129, 119, 0.08)',
                            borderRadius: 'var(--radius)'
                        }}
                    >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h3 className="font-bold text-lg" style={{ color: 'var(--charcoal)' }}>
                                        {c.subject}
                                    </h3>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide shadow-sm ${statusColors[statusMap[c.status]] || ''}`}>
                                        {statusMap[c.status]}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--charcoal-medium)' }} className="text-sm leading-relaxed mt-2">
                                    {c.description}
                                </p>
                                
                                {c.adminResponse && (
                                    <div className="text-sm mt-4 p-3 rounded border" style={{ backgroundColor: 'var(--surface-muted)', borderColor: 'rgba(66, 129, 119, 0.06)' }}>
                                        <p style={{ color: 'var(--charcoal)' }} className="font-medium">
                                            <span style={{ color: 'var(--forest-dark)' }} className="font-bold">{t('admin.complaints.adminResponseLabel')}:</span> {c.adminResponse}
                                        </p>
                                    </div>
                                )}
                                
                                <p className="text-xs font-medium mt-3" style={{ color: 'var(--text-muted)' }}>
                                    By: <span className="font-semibold" style={{ color: 'var(--charcoal-medium)' }}>{c.userName} ({c.userRole})</span> • {new Date(c.createdAt).toLocaleString()}
                                </p>
                            </div>
                            
                            <button 
                                onClick={() => openRespondModal(c)} 
                                className="outline-button px-4 py-2 text-xs font-semibold shrink-0"
                                style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                                {t('admin.complaints.respond')}
                            </button>
                        </div>
                    </div>
                ))}
                
                {complaints.length === 0 && (
                    <div className="text-center py-12 card" style={{ backgroundColor: 'var(--surface)' }}>
                        <p className="text-base font-medium" style={{ color: 'var(--charcoal-medium)' }}>
                            {t('admin.complaints.noComplaints')}
                        </p>
                    </div>
                )}
            </div>

            {/* Respond Modal Backdrop */}
            {respondModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div 
                        className="card w-full max-w-2xl p-6 shadow-xl border animate-scale-up" 
                        style={{ backgroundColor: 'var(--surface)', borderColor: 'rgba(66, 129, 119, 0.16)' }}
                    >
                        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--forest-dark)' }}>
                            {t('admin.complaints.respondToTitle', { subject: respondModal.subject })}
                        </h2>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="form-label block text-sm font-semibold mb-1.5">{t('admin.complaints.status')}</label>
                                <select 
                                    value={respondData.status} 
                                    onChange={(e) => setRespondData({ ...respondData, status: parseInt(e.target.value) })}
                                    className="input-field w-full focus:ring-2"
                                >
                                    <option value={1}>{t('admin.complaints.inReview')}</option>
                                    <option value={2}>{t('admin.complaints.resolved')}</option>
                                    <option value={3}>{t('admin.complaints.rejected')}</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="form-label block text-sm font-semibold mb-1.5">{t('admin.complaints.adminResponseLabel')}</label>
                                <textarea 
                                    value={respondData.adminResponse} 
                                    onChange={(e) => setRespondData({ ...respondData, adminResponse: e.target.value })}
                                    placeholder={t('admin.complaints.responsePlaceholder')}
                                    className="input-field w-full h-36 resize-none focus:ring-2"
                                />
                            </div>
                            
                            <div className="flex gap-3 justify-end pt-2">
                                <button 
                                    onClick={() => setRespondModal(null)}
                                    className="outline-button px-5 py-2.5 text-sm font-medium"
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button 
                                    onClick={handleRespond}
                                    className="primary-button px-5 py-2.5 text-sm font-semibold shadow-sm"
                                    style={{ borderRadius: 'var(--radius-sm)' }}
                                >
                                    {t('admin.complaints.sendResponse')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}