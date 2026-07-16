import { useState, useEffect } from 'react';
import { getMyChangeRequests, submitChangeRequest } from '../../services/api';
import { useTranslation } from 'react-i18next';
export default function DriverChangeRequests() {
    const { t } = useTranslation();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: 0, currentValue: '', requestedValue: '', reason: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const typeLabels = {
        0: t('generated.pages_driver_DriverChangeRequests_type_phoneNumber'),
        1: t('generated.pages_driver_DriverChangeRequests_type_password'),
        2: t('generated.pages_driver_DriverChangeRequests_type_routeAssignment'),
        3: t('generated.pages_driver_DriverChangeRequests_type_profileData')
    };

    const statusLabels = {
        0: t('generated.pages_driver_DriverChangeRequests_status_pending'),
        1: t('generated.pages_driver_DriverChangeRequests_status_approved'),
        2: t('generated.pages_driver_DriverChangeRequests_status_rejected')
    };

    const fetchRequests = async () => {
        try {
            const { data } = await getMyChangeRequests();
            setRequests(data);
        } catch {
            setError(t('generated.pages_driver_DriverChangeRequests_load_failed'));
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
            setSuccess(t('generated.pages_driver_DriverChangeRequests_submitted_success'));
            setForm({ type: 0, currentValue: '', requestedValue: '', reason: '' });
            setShowForm(false);
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.Detailed || t('generated.pages_driver_DriverChangeRequests_submission_failed'));
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;

    return (
        <div>
            <h1 style={{margin:'20px 0'}} className="text-2xl font-bold mb-6">{t('generated.pages_driver_DriverChangeRequests_jsx_62_617eece0') }</h1>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}

            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-medium transition-colors"
                >
                    {`+ ${t('generated.pages_driver_DriverChangeRequests_new')}`}
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 mb-6 grid gap-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">{t('generated.pages_driver_DriverChangeRequests_jsx_77_0a6900d1') }</label>
                        <select
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="0">{t('generated.pages_driver_DriverChangeRequests_jsx_83_ab25d61b') }</option>
                            <option value="1">{t('generated.pages_driver_DriverChangeRequests_jsx_84_8be3c943') }</option>
                            <option value="2">{t('generated.pages_driver_DriverChangeRequests_jsx_85_176b21a7') }</option>
                            <option value="3">{t('generated.pages_driver_DriverChangeRequests_jsx_86_17828656') }</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">{t('generated.pages_driver_DriverChangeRequests_jsx_90_4f993153') }</label>
                        <input
                            type="text"
                            value={form.currentValue}
                            onChange={e => setForm({ ...form, currentValue: e.target.value })}
                            placeholder={t('generated.pages_driver_DriverChangeRequests_jsx_95_ed2757f1')}
                            required
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">{t('generated.pages_driver_DriverChangeRequests_jsx_101_b0349be8') }</label>
                        <input
                            type="text"
                            value={form.requestedValue}
                            onChange={e => setForm({ ...form, requestedValue: e.target.value })}
                            placeholder={t('generated.pages_driver_DriverChangeRequests_jsx_106_5beff708')}
                            required
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">{t('generated.pages_driver_DriverChangeRequests_jsx_112_dbd7876f') }</label>
                        <textarea
                            value={form.reason}
                            onChange={e => setForm({ ...form, reason: e.target.value })}
                            placeholder={t('generated.pages_driver_DriverChangeRequests_jsx_116_aff05a5d')}
                            rows="3"
                            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors">{t('generated.pages_driver_DriverChangeRequests_jsx_122_d0015743') }</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-medium transition-colors">{t('generated.pages_driver_DriverChangeRequests_jsx_123_77dfd213') }</button>
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
                                <span className="text-slate-400">{t('generated.pages_driver_DriverChangeRequests_jsx_146_19889c90') }</span>
                                <p className="text-white font-mono ml-2">{req.currentValue}</p>
                            </div>
                            <div>
                                <span className="text-slate-400">{t('generated.pages_driver_DriverChangeRequests_jsx_150_0bb6adcc') }</span>
                                <p className="text-white font-mono ml-2">{req.requestedValue}</p>
                            </div>
                            {req.reason && (
                                <div>
                                    <span className="text-slate-400">{t('generated.pages_driver_DriverChangeRequests_jsx_155_2c25e64f') }</span>
                                    <p className="text-white ml-2">{req.reason}</p>
                                </div>
                            )}
                            {req.adminNotes && (
                                <div>
                                    <span className="text-slate-400">{t('generated.pages_driver_DriverChangeRequests_jsx_161_3fd6e610') }</span>
                                    <p className="text-white ml-2">{req.adminNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {requests.length === 0 && (
                    <p className="text-center text-slate-500 py-10">{t('generated.pages_driver_DriverChangeRequests_jsx_169_0578afe6') }</p>
                )}
            </div>
        </div>
    );
}
