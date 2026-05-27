import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDriverProfile, getUser } from '../../services/api';

export default function ManageDriversDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDriver = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const [{ data: userData }, { data: profileData }] = await Promise.all([
          getUser(id),
          getDriverProfile(id),
        ]);
        setDriver(userData);
        setProfile(profileData);
      } catch (err) {
        setError(err.response?.data?.Detailed || err.response?.data || 'Failed to load driver details');
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id]);

  const formatDate = (raw) => {
    if (!raw) return '-';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? raw : date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
        >
          ← Back
        </button>
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    
    <div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Driver Details</h1>
          <p className="text-slate-400 text-sm">Review the full driver profile and account information.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
        >
          ← Back
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h2 className="font-semibold text-lg mb-4">Account</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <div>
              <span className="text-slate-400">Full Name:</span> {driver?.fullName || '-'}
            </div>
            <div>
              <span className="text-slate-400">Email:</span> {driver?.email || '-'}
            </div>
            <div>
              <span className="text-slate-400">Phone:</span> {driver?.phoneNumber || '-'}
            </div>
            <div>
              <span className="text-slate-400">Role:</span> {driver?.role || '-'}
            </div>
            <div>
              <span className="text-slate-400">Status:</span> {driver?.accountStatus || '-'}
            </div>
            <div>
              <span className="text-slate-400">Created:</span> {formatDate(driver?.createdAt)}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h2 className="font-semibold text-lg mb-4">License & Vehicle</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <div>
              <span className="text-slate-400">License Number:</span> {profile?.licenseNumber || '-'}
            </div>
            <div>
              <span className="text-slate-400">License Category:</span> {profile?.licenseCategory || '-'}
            </div>
            <div>
              <span className="text-slate-400">Issuing Authority:</span> {profile?.issuingAuthority || '-'}
            </div>
            <div>
              <span className="text-slate-400">License Expiry:</span> {formatDate(profile?.licenseExpiryDate)}
            </div>
            <div>
              <span className="text-slate-400">Vehicle Plate:</span> {profile?.vehiclePlateNumber || '-'}
            </div>
            <div>
              <span className="text-slate-400">Vehicle Model:</span> {profile?.vehicleModel || '-'}
            </div>
            <div>
              <span className="text-slate-400">Vehicle Color:</span> {profile?.vehicleColor || '-'}
            </div>
            <div>
              <span className="text-slate-400">Registration Expiry:</span> {formatDate(profile?.registrationExpiryDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
