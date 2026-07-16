import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrganizers, createOrganizer, updateOrganizer, deleteOrganizer } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';

export default function ManageOrganizers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', firstName: '', lastName: '', gender: '', dateOfBirth: '', city: '', region: '', nationalIdNumber: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  const fetchOrganizers = async () => {
    try {
      const { data } = await getOrganizers();
      setOrganizers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const openNew = () => {
    setForm({ fullName: '', email: '', phoneNumber: '', password: '', firstName: '', lastName: '', gender: '', dateOfBirth: '', city: '', region: '', nationalIdNumber: '' });
    setEditId(null);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const startEdit = (organizer) => {
    setForm({ fullName: organizer.fullName || '', email: organizer.email || '', phoneNumber: organizer.phoneNumber || '', password: '', firstName: organizer.firstName || '', lastName: organizer.lastName || '', gender: organizer.gender || '', dateOfBirth: organizer.dateOfBirth || '', city: organizer.city || '', region: organizer.region || '', nationalIdNumber: organizer.nationalIdNumber || '' });
    setEditId(organizer.id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editId) {
        const payload = { fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber, firstName: form.firstName, lastName: form.lastName, gender: form.gender, dateOfBirth: form.dateOfBirth || null, city: form.city, region: form.region, nationalIdNumber: form.nationalIdNumber };
        if (form.password) payload.password = form.password;
        await updateOrganizer(editId, payload);
        setSuccess(t('organizer.manage.updated', 'Organizer updated'));
      } else {
        await createOrganizer({ fullName: form.fullName, email: form.email, phoneNumber: form.phoneNumber, password: form.password, role: 'QueueOrganizer', firstName: form.firstName, lastName: form.lastName, gender: form.gender, dateOfBirth: form.dateOfBirth || null, city: form.city, region: form.region, nationalIdNumber: form.nationalIdNumber });
        setSuccess(t('organizer.manage.created', 'Organizer created'));
      }

      setShowForm(false);
      fetchOrganizers();
    } catch (err) {
      setError(err.response?.data?.Detailed || err.response?.data || t('organizer.manage.saveFailed', 'Save failed'));
    }
  };

  const handleDelete = (id) => setConfirmingDeleteId(id);

  const confirmDelete = async () => {
    if (!confirmingDeleteId) return;
    try {
      await deleteOrganizer(confirmingDeleteId);
      setSuccess(t('organizer.manage.deleted', 'Organizer deleted'));
      fetchOrganizers();
    } catch (err) {
      setError(err.response?.data?.Detailed || err.response?.data || t('organizer.manage.deleteFailed', 'Delete failed'));
    } finally {
      setConfirmingDeleteId(null);
    }
  };

  if (loading) return (
    <div className="content-wrapper py-6">
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
      </div>
    </div>
  );

  return (
    <div className="content-wrapper py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{margin:'20px 0'}} className="text-2xl font-bold text-[var(--charcoal)]">{t('organizer.manage.title', 'Manage Organizers')}</h1>
        <button className="primary-button" onClick={openNew}>+ {t('organizer.manage.new', 'New Organizer')}</button>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}
      {success && <div className="alert alert-success mb-4">{success}</div>}

      {showForm && (
        <div className="card p-4 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">{t('auditor.profile.fullName', 'Full name')}</label>
              <input className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.email', 'Email')}</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.phone', 'Phone')}</label>
              <input className="input-field" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.firstName', 'First name')}</label>
              <input className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.lastName', 'Last name')}</label>
              <input className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.gender', 'Gender')}</label>
              <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">{t('auditor.profile.selectGender', 'Select')}</option>
                <option value="Male">{t('auth.male', 'Male')}</option>
                <option value="Female">{t('auth.female', 'Female')}</option>
              </select>
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.dateOfBirth', 'Date of birth')}</label>
              <input type="date" className="input-field" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.city', 'City')}</label>
              <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.region', 'Region')}</label>
              <input className="input-field" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.nationalIdNumber', 'National ID')}</label>
              <input className="input-field" value={form.nationalIdNumber} onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })} />
            </div>
            <div>
              <label className="form-label">{t('auditor.profile.password', 'Password')}</label>
              <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} { ...(editId ? {} : { required: true }) } />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="primary-button">{t('auditor.profile.save', 'Save')}</button>
              <button type="button" className="danger-button" onClick={() => { setShowForm(false); setEditId(null); }}>{t('auditor.profile.cancel', 'Cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-4">
        {organizers.length === 0 ? (
          <div className="text-sm text-[var(--charcoal-medium)]">{t('organizer.manage.empty', 'No organizers found.')}</div>
        ) : (
          <div className="table-shell">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-[var(--charcoal-medium)]">
                  <th className="py-2">{t('profile.name', 'Name')}</th>
                  <th className="py-2">{t('profile.email', 'Email / Phone')}</th>
                  <th className="py-2">{t('profile.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="py-3"> <div className="font-semibold text-[var(--charcoal)]">{a.fullName}</div> </td>
                    <td className="py-3 text-sm text-[var(--charcoal-medium)]">{a.email}{a.phoneNumber ? ` · ${a.phoneNumber}` : ''}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="outline-button" onClick={() => startEdit(a)}>{t('common.edit', 'Edit')}</button>
                        <button className="outline-button" onClick={() => navigate(`/admin/organizers/${a.id}`)}>{t('common.viewDetails', 'View')}</button>
                        <button className="danger-button" onClick={() => handleDelete(a.id)}>{t('common.delete', 'Delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationModal open={Boolean(confirmingDeleteId)} title={t('organizer.manage.confirmDeleteTitle', 'Confirm delete')} message={t('organizer.manage.confirmDeleteMessage', 'Delete this organizer?')} confirmText={t('common.delete', 'Delete')} cancelText={t('common.cancel', 'Cancel')} danger onConfirm={confirmDelete} onCancel={() => setConfirmingDeleteId(null)} />
    </div>
  );
}
