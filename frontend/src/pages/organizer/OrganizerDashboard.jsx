import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function OrganizerDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // placeholder: would fetch dashboard stats from organizer-specific endpoint
    setStats({ totalPackages: 0, todaysPackages: 0, totalTripsWaiting: 0, upcomingDepartures: 0 });
  }, []);

  return (
    <div className="content-wrapper py-6">
      <h1 className="text-2xl font-bold mb-4">{t('organizer.dashboard.title', 'Organizer Dashboard')}</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">Total Packages<br/><span className="font-bold">{stats?.totalPackages}</span></div>
        <div className="card p-4">Today's Packages<br/><span className="font-bold">{stats?.todaysPackages}</span></div>
        <div className="card p-4">Trips Waiting<br/><span className="font-bold">{stats?.totalTripsWaiting}</span></div>
        <div className="card p-4">Upcoming Departures<br/><span className="font-bold">{stats?.upcomingDepartures}</span></div>
      </div>
    </div>
  );
}
