import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTripDetails } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function TripDetails() {
    const { t } = useTranslation();
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const startLocation =
        trip?.startLocation ||
        trip?.route?.startLocation ||
        trip?.routeSource ||
        t('citizen.favoriteTrips.notAvailable');
    const endLocation =
        trip?.endLocation ||
        trip?.route?.endLocation ||
        trip?.routeDestination ||
        t('citizen.favoriteTrips.notAvailable');

    const statusLabels = {
        0: t('generated.pages_admin_TripDetails_status_scheduled'),
        1: t('generated.pages_admin_TripDetails_status_started'),
        2: t('generated.pages_admin_TripDetails_status_delayed'),
        3: t('generated.pages_admin_TripDetails_status_finished'),
        4: t('generated.pages_admin_TripDetails_status_cancelled')
    };

    const bookingStatusLabels = {
        0: t('generated.pages_admin_TripDetails_bookingStatus_confirmed'),
        1: t('generated.pages_admin_TripDetails_bookingStatus_cancelled')
    };

    const fetchTripDetails = async () => {
        try {
            const { data } = await getTripDetails(tripId);
            setTrip(data);
        } catch (err) {
            setError(err.response?.data?.message || t('generated.pages_admin_TripDetails_load_failed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTripDetails(); }, [tripId]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="content-wrapper py-6">
                <div className="alert alert-error max-w-xl mx-auto text-center">
                    {error}
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="content-wrapper py-6">
                <div className="alert alert-error max-w-xl mx-auto text-center">
                    {t('generated.pages_admin_TripDetails_jsx_41_29912dd0')}
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper py-6">
            <h1 style={{margin:'20px 0'}} className="text-2xl font-bold mb-6 text-[var(--charcoal)]">
                {t('generated.pages_admin_TripDetails_jsx_45_6bb56d94')}
            </h1>

            {/* Trip Overview Layout Deck */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Panel 1: Route & Logistics Basic Info */}
                <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
                    <h2 className="text-lg font-bold mb-4 text-[var(--forest-dark)] pb-2 border-b border-[rgba(66,129,119,0.06)]">
                        {t('generated.pages_admin_TripDetails_jsx_51_353d8dbd')}
                    </h2>
                    <div className="grid gap-3.5 text-sm">
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_54_f82a5fe0')}</span>
                            <p className="text-[var(--charcoal)] font-medium">{startLocation}</p>
                        </div>
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_58_7fbb1d78')}</span>
                            <p className="text-[var(--charcoal)] font-medium">{endLocation}</p>
                        </div>
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_62_5bdd70d3')}</span>
                            <p className="font-mono bg-[var(--surface-muted)] px-2 py-0.5 border border-[rgba(66,129,119,0.08)] rounded text-xs font-bold text-[var(--charcoal)] inline-block">{trip.busNumber}</p>
                        </div>
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_66_11dc9e19')}</span>
                            <p className="text-[var(--charcoal-medium)] font-medium">{statusLabels[trip.status] || t('common.unknown')}</p>
                        </div>
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_70_56c67230')}</span>
                            <p className="text-[var(--charcoal-medium)]">{new Date(trip.departureTime).toLocaleString()}</p>
                        </div>
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_74_7b5cd793')}</span>
                            <p className="text-[var(--charcoal-medium)]">{trip.arrivalTime ? new Date(trip.arrivalTime).toLocaleString() : t('citizen.favoriteTrips.notAvailable')}</p>
                        </div>
                    </div>
                </div>

                {/* Panel 2: Assigned Operator / Driver Info */}
                <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
                    <h2 className="text-lg font-bold mb-4 text-[var(--forest-dark)] pb-2 border-b border-[rgba(66,129,119,0.06)]">
                        {t('generated.pages_admin_TripDetails_jsx_82_d694c3e3')}
                    </h2>
                    <div className="grid gap-4 text-sm">
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_85_8114f5f0')}</span>
                            <p className="text-[var(--charcoal)] font-bold">{trip.driverName}</p>
                        </div>
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_89_daeea4d0')}</span>
                            <p className="text-[var(--charcoal-medium)] font-mono font-medium">{trip.driverPhone || t('citizen.favoriteTrips.notAvailable')}</p>
                        </div>
                        <div>
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">{t('generated.pages_admin_TripDetails_jsx_93_ea0d0ed5')}</span>
                            <p className="text-muted font-mono text-xs break-all bg-[var(--surface-soft)] p-2 rounded border border-[rgba(66,129,119,0.05)]">{trip.driverId}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transit Unit Seat Usage & Occupancy Metrics */}
            <div className="card p-6 border border-[rgba(66,129,119,0.1)] mb-6">
                <h2 className="text-lg font-bold mb-4 text-[var(--charcoal)]">
                    {t('generated.pages_admin_TripDetails_jsx_102_93f91b59')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[rgba(66,129,119,0.05)]">
                        <span className="text-muted text-xs font-medium block mb-1">{t('generated.pages_admin_TripDetails_jsx_105_dcf4b722')}</span>
                        <p className="text-2xl font-black text-[var(--charcoal)]">{trip.seatUsage.totalSeats}</p>
                    </div>
                    <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[rgba(66,129,119,0.05)]">
                        <span className="text-muted text-xs font-medium block mb-1">{t('generated.pages_admin_TripDetails_jsx_109_a6cae755')}</span>
                        <p className="text-2xl font-black text-[var(--forest-dark)]">{trip.seatUsage.reservedSeats}</p>
                    </div>
                    <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[rgba(66,129,119,0.05)]">
                        <span className="text-muted text-xs font-medium block mb-1">{t('generated.pages_admin_TripDetails_jsx_113_4a8c2fb2')}</span>
                        <p className="text-2xl font-black text-blue-600">{trip.seatUsage.availableSeats}</p>
                    </div>
                    <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[rgba(66,129,119,0.05)]">
                        <span className="text-muted text-xs font-medium block mb-1">{t('generated.pages_admin_TripDetails_jsx_117_38aba000')}</span>
                        <p className="text-2xl font-black text-[var(--charcoal)]">{trip.seatUsage.occupancyPercentage.toFixed(1)}%</p>
                    </div>
                </div>
                {/* Visual Framework Data Meter Progress Bar */}
                <div className="mt-5 w-full bg-[var(--surface-muted)] border border-[rgba(66,129,119,0.08)] rounded-full overflow-hidden h-2.5">
                    <div 
                        className="bg-gradient-to-r from-[var(--forest)] to-blue-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${trip.seatUsage.occupancyPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Verified Passengers Registry Manifest */}
            <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
                <h2 className="text-lg font-bold mb-4 text-[var(--charcoal)]">
                    {t('generated.pages_admin_TripDetails_jsx_132_7dae1323', { count: trip.passengers.length })}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[rgba(66,129,119,0.1)]">
                                <th className="text-start py-3 px-4 text-muted font-semibold uppercase tracking-wider text-xs">{t('generated.pages_admin_TripDetails_jsx_136_3c4105d2')}</th>
                                <th className="text-start py-3 px-4 text-muted font-semibold uppercase tracking-wider text-xs">{t('generated.pages_admin_TripDetails_jsx_137_77064d52')}</th>
                                <th className="text-center py-3 px-4 text-muted font-semibold uppercase tracking-wider text-xs">{t('generated.pages_admin_TripDetails_jsx_138_692aab50')}</th>
                                <th className="text-start py-3 px-4 text-muted font-semibold uppercase tracking-wider text-xs">{t('generated.pages_admin_TripDetails_jsx_139_e3065c01')}</th>
                                <th className="text-center py-3 px-4 text-muted font-semibold uppercase tracking-wider text-xs">{t('generated.pages_admin_TripDetails_jsx_140_bae7d5be')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(66,129,119,0.05)]">
                            {trip.passengers.map((passenger) => (
                                <tr key={passenger.passengerId} className="hover:bg-[var(--surface-soft)] transition-colors group">
                                    <td className="py-3.5 px-4 font-medium text-[var(--charcoal)]">{passenger.passengerName}</td>
                                    <td className="py-3.5 px-4 text-[var(--charcoal-medium)] font-mono text-xs">{passenger.passengerPhone || 'N/A'}</td>
                                    <td className="py-3.5 px-4 text-center text-[var(--charcoal)] font-bold">{passenger.seatCount}</td>
                                    <td className="py-3.5 px-4 text-muted">{new Date(passenger.bookedAt).toLocaleString()}</td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                                            passenger.status === 0 
                                                ? 'bg-[var(--forest-100)] text-[var(--forest-dark)]' 
                                                : 'text-red-700 bg-red-50'
                                        }`}>
                                            {bookingStatusLabels[passenger.status] || t('common.unknown')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {trip.passengers.length === 0 && (
                    <p className="text-center text-muted py-12 text-sm italic">
                        {t('generated.pages_admin_TripDetails_jsx_163_1df9bc36')}
                    </p>
                )}
            </div>
        </div>
    );
}