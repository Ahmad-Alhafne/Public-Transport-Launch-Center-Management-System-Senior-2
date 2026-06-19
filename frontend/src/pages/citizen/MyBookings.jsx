import { useState, useEffect } from 'react';
import { getMyActiveBookings, getMyBookingHistory, cancelBooking } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function MyBookings() {
    const { t } = useTranslation();
    const [activeBookings, setActiveBookings] = useState([]);
    const [historyBookings, setHistoryBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [cancelCode, setCancelCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [filters, setFilters] = useState({
        bookedDate: '',
        departureDate: '',
        seatCount: ''
    });

    const fetchBookings = async () => {
        try {
            const [activeResponse, historyResponse] = await Promise.all([
                getMyActiveBookings(),
                getMyBookingHistory()
            ]);
            setActiveBookings(activeResponse.data);
            setHistoryBookings(historyResponse.data);
        } catch {
            setError(t('generated.pages_citizen_MyBookings_jsx_20_11e66235'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchBookings(); 
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchBookings, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCancel = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await cancelBooking({ cancellationCode: cancelCode });
            setSuccess(t('generated.pages_citizen_MyBookings_jsx_47_72cb6b26'));
            setCancelCode('');
            fetchBookings();
        } catch (err) { 
            setError(err.response?.data?.Detailed || t('generated.pages_citizen_MyBookings_jsx_51_7d4ac1e7')); 
        }
    };

    const renderBookingCard = (booking, showCancellationCode = true) => {
        const tripStatus = booking.tripStatus || 'Unknown';
        const delayMinutes = booking.tripDelayMinutes ?? 0;
        const baseDeparture = new Date(booking.tripDepartureTimeUtc);
        const adjustedDeparture = new Date(baseDeparture.getTime() + delayMinutes * 60000);

        // Map trip status badges accurately to custom style guide layout tokens
        const statusColors = {
            Scheduled: 'bg-[var(--wheat-light)] text-[var(--wheat-dark)] border border-[rgba(185,167,121,0.25)]',
            Started: 'bg-[var(--forest-100)] text-[var(--forest-dark)] border border-[rgba(66,129,119,0.2)]',
            Delayed: 'bg-[var(--wheat-light)] text-[var(--wheat-dark)] border border-[rgba(185,167,121,0.4)]',
            Finished: 'bg-[var(--surface-muted)] text-[#525050] border border-[rgba(66,129,119,0.08)]',
            Cancelled: 'bg-[rgba(107,31,42,0.08)] text-[var(--umber-dark)] border border-[rgba(107,31,42,0.2)]'
        };

        return (
            <div key={booking.id} className="card p-6 border border-[rgba(66,129,119,0.1)]">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <p className="font-bold text-base text-[var(--charcoal)]">{booking.passengerName}</p>
                        <p className="text-sm text-muted">
                            {t('generated.pages_citizen_MyBookings_jsx_71_5825bc2c')}: {new Date(booking.bookedAt).toLocaleString()}
                        </p>
                        <p className="text-sm font-medium text-[var(--charcoal-medium)]">
                            {t('generated.pages_citizen_MyBookings_jsx_75_b5f97c79')}: {adjustedDeparture.toLocaleString()}
                            {delayMinutes > 0 && (
                                <span className="text-xs text-[var(--umber-dark)] font-semibold ml-2 bg-[rgba(107,31,42,0.08)] px-2 py-0.5 rounded">
                                    (+{delayMinutes} min)
                                </span>
                            )}
                        </p>
                        <p className="text-xs text-muted">
                            {t('generated.pages_citizen_MyBookings_jsx_78_70d30f84')} 
                            <span className="text-[var(--charcoal-medium)] font-mono font-semibold ml-1">{booking.seatCount ?? 1}</span>
                        </p>
                        {showCancellationCode && (
                            <p className="text-xs text-muted">
                                {t('generated.pages_citizen_MyBookings_jsx_80_ca567dda')} 
                                <span className="text-[var(--forest-dark)] font-mono font-bold ml-1">{booking.cancellationCode}</span>
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2.5">
                        {/* Booking State Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                            booking.status === 'Confirmed' || booking.status === 0 
                                ? 'bg-[var(--forest-100)] text-[var(--forest-dark)]' 
                                : 'bg-[rgba(107,31,42,0.08)] text-[var(--umber-dark)]'
                        }`}>
                            {booking.status === 0 ? t('generated.pages_citizen_MyBookings_status_confirmed') : booking.status === 1 ? t('generated.pages_citizen_MyBookings_status_cancelled') : booking.status}
                        </span>
                        
                        {/* Vehicle Transit State Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${statusColors[tripStatus] || 'bg-[var(--surface-muted)] text-muted'}`}>
                            {tripStatus}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--forest)]"></div>
            </div>
        );
    }

    const currentBookings = activeTab === 'active' ? activeBookings : historyBookings;

    const filteredBookings = currentBookings.filter(booking => {
        const matchesBookedDate = !filters.bookedDate || new Date(booking.bookedAt).toLocaleDateString().includes(filters.bookedDate);
        const matchesDepartureDate = !filters.departureDate || new Date(booking.tripDepartureTimeUtc).toLocaleDateString().includes(filters.departureDate);
        const matchesSeatCount = !filters.seatCount || (booking.seatCount ?? 1).toString().includes(filters.seatCount);
        return matchesBookedDate && matchesDepartureDate && matchesSeatCount;
    });

    return (
        <div className="content-wrapper py-6">
            {/* Tab Navigation Controls */}
            <div className="flex gap-1 mb-6 bg-[var(--surface-muted)] p-1 rounded-xl border border-[rgba(66,129,119,0.08)]">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-150 ${
                        activeTab === 'active'
                            ? 'bg-[var(--forest)] text-white shadow-sm'
                            : 'text-[var(--charcoal-medium)] hover:text-[var(--charcoal)] hover:bg-[var(--surface-soft)]'
                    }`}
                >
                    {t('generated.pages_citizen_MyBookings_jsx_119_312b5688', { count: activeBookings.length })}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-150 ${
                        activeTab === 'history'
                            ? 'bg-[var(--forest)] text-white shadow-sm'
                            : 'text-[var(--charcoal-medium)] hover:text-[var(--charcoal)] hover:bg-[var(--surface-soft)]'
                    }`}
                >
                    {t('generated.pages_citizen_MyBookings_jsx_127_8abd2d99', { count: historyBookings.length })}
                </button>
            </div>

            {/* Custom Banner Error & Success Prompts */}
            {error && <div className="alert alert-error mb-6">{error}</div>}
            {success && <div className="alert alert-success mb-6">{success}</div>}

            {/* Parameter Search Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder={t('generated.pages_citizen_MyBookings_jsx_142_671acdb2')}
                    value={filters.bookedDate}
                    onChange={(e) => setFilters({ ...filters, bookedDate: e.target.value })}
                    className="input-field"
                />
                <input
                    type="text"
                    placeholder={t('generated.pages_citizen_MyBookings_jsx_149_8473a6fd')}
                    value={filters.departureDate}
                    onChange={(e) => setFilters({ ...filters, departureDate: e.target.value })}
                    className="input-field"
                />
                <input
                    type="number"
                    placeholder={t('generated.pages_citizen_MyBookings_jsx_156_79e9aab1')}
                    value={filters.seatCount}
                    onChange={(e) => setFilters({ ...filters, seatCount: e.target.value })}
                    className="input-field"
                />
            </div>

            {/* Cancellation Form Header Action */}
            {activeTab === 'active' && (
                <form onSubmit={handleCancel} className="card p-5 border border-[rgba(107,31,42,0.15)] mb-6 flex flex-col sm:flex-row gap-3">
                    <input
                        placeholder={t('generated.pages_citizen_MyBookings_jsx_167_d7832054')}
                        value={cancelCode}
                        onChange={e => setCancelCode(e.target.value)}
                        required
                        className="input-field flex-1"
                    />
                    <button 
                        type="submit" 
                        className="danger-button px-6 py-3 text-sm font-medium whitespace-nowrap"
                    >
                        {t('generated.pages_citizen_MyBookings_jsx_179_b3e7c0ad')}
                    </button>
                </form>
            )}

            {/* Main Dynamic Result Grid Content */}
            <div className="grid gap-4">
                {filteredBookings.map(booking => renderBookingCard(booking, activeTab === 'active'))}
                
                {filteredBookings.length === 0 && (
                    <p className="text-center text-muted py-12 card bg-surface-muted">
                        {currentBookings.length === 0 
                            ? (activeTab === 'active' ? t('generated.pages_citizen_MyBookings_jsx_183_5fcbc5e3') : t('generated.pages_citizen_MyBookings_jsx_183_5fcbc5e3_history'))
                            : t('generated.pages_citizen_MyBookings_jsx_185_0b1fa2a4')
                        }
                    </p>
                )}
            </div>
        </div>
    );
}