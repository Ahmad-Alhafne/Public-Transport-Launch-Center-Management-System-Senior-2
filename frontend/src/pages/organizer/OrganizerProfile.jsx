import { useEffect, useState } from 'react';
import { getMyProfile, updateMyProfile } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function OrganizerProfile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyProfile();
        setProfile(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <div className="content-wrapper py-6">Loading...</div>;
  if (!profile) return <div className="content-wrapper py-6">No profile</div>;

  return (
    <div className="content-wrapper py-6">
      <h1 className="text-2xl font-bold mb-4">{t('organizer.profile.title', 'Organizer Profile')}</h1>
      <div className="card p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-[var(--charcoal-medium)]">{t('profile.fullName', 'Full name')}</div>
            <div className="font-semibold">{profile.fullName}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--charcoal-medium)]">{t('profile.email', 'Email')}</div>
            <div className="font-semibold">{profile.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
