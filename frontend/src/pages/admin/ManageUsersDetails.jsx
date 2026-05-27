import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser } from '../../services/api';

export default function ManageUsersDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const { data } = await getUser(id);
        setUser(data);
      } catch (err) {
        setError(err.response?.data?.Detailed || err.response?.data || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
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
          <h1 className="text-2xl font-bold">User Details</h1>
          <p className="text-slate-400 text-sm">Review the full profile information for the selected user.</p>
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
              <span className="text-slate-400">Full Name:</span> {user.fullName || '-'}
            </div>
            <div>
              <span className="text-slate-400">Email:</span> {user.email || '-'}
            </div>
            <div>
              <span className="text-slate-400">Phone:</span> {user.phoneNumber || '-'}
            </div>
            <div>
              <span className="text-slate-400">Role:</span> {user.role || '-'}
            </div>
            <div>
              <span className="text-slate-400">Status:</span> {user.accountStatus || '-'}
            </div>
            <div>
              <span className="text-slate-400">Created:</span> {formatDate(user.createdAt)}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
          <h2 className="font-semibold text-lg mb-4">Personal Information</h2>
          <div className="space-y-2 text-sm text-slate-300">
            <div>
              <span className="text-slate-400">First Name:</span> {user.firstName || '-'}
            </div>
            <div>
              <span className="text-slate-400">Last Name:</span> {user.lastName || '-'}
            </div>
            <div>
              <span className="text-slate-400">Gender:</span> {user.gender || '-'}
            </div>
            <div>
              <span className="text-slate-400">Date of Birth:</span> {formatDate(user.dateOfBirth)}
            </div>
            <div>
              <span className="text-slate-400">City:</span> {user.city || '-'}
            </div>
            <div>
              <span className="text-slate-400">Region:</span> {user.region || '-'}
            </div>
            <div>
              <span className="text-slate-400">Disability Status:</span> {user.disabilityStatus || '-'}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 md:col-span-2">
          <h2 className="font-semibold text-lg mb-4">Identification & Address</h2>
          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-300">
            <div className="space-y-2">
              <div>
                <span className="text-slate-400">National ID:</span> {user.nationalIdNumber || '-'}
              </div>
              <div>
                <span className="text-slate-400">Card Number:</span> {user.cardNumber || '-'}
              </div>
              <div>
                <span className="text-slate-400">Card Issue Date:</span> {formatDate(user.cardIssueDate)}
              </div>
              <div>
                <span className="text-slate-400">Face Color:</span> {user.faceColor || '-'}
              </div>
              <div>
                <span className="text-slate-400">Eye Color:</span> {user.eyeColor || '-'}
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400">Father Name:</span> {user.fatherName || '-'}
              </div>
              <div>
                <span className="text-slate-400">Mother Name:</span> {user.motherName || '-'}
              </div>
              <div>
                <span className="text-slate-400">Birth Place:</span> {user.birthPlace || '-'}
              </div>
              <div>
                <span className="text-slate-400">Current Address:</span> {user.currentAddress || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
