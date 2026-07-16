import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useLocation } from 'react-router-dom';
import { getMyActiveBookings, getMyBookingHistory, cancelBooking, createEmergency } from '../../services/api';
import EmergencyReportModal from '../../components/EmergencyReportModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useTranslation } from 'react-i18next';

export default function MyBookings() {
    const { t } = useTranslation();
    const location = useLocation();

    const translateTripStatus = (status) => {
        if (!status) return '';
        const normalized = status.replace(/\s+/g, '');
        const normalizedTitle = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
        return t(`citizen.trips.status_${normalizedTitle}`, {
            defaultValue: t(`citizen.trips.status${normalizedTitle}`, { defaultValue: status })
        });
    };
    const [activeBookings, setActiveBookings] = useState([]);
    const [historyBookings, setHistoryBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEmergencyModalOpen, setEmergencyModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [qrModalBooking, setQrModalBooking] = useState(null);
    const [emergencyForm, setEmergencyForm] = useState({
        type: 'Medical',
        priority: 'High',
        description: ''
    });

    const [filters, setFilters] = useState({
        bookedDate: '',
        departureDate: '',
        seatCount: ''
    });

    useEffect(() => {
        if (location.state?.paymentMessage) {
            if (location.state.messageType === 'success') {
                setSuccess(location.state.paymentMessage);
            } else if (location.state.messageType === 'error') {
                setError(location.state.paymentMessage);
            }
        }
    }, [location.state?.paymentMessage]);

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

    const confirmCancelBooking = async () => {
        if (!bookingToCancel?.cancellationCode) return;

        setError(''); setSuccess('');
        try {
            await cancelBooking({ cancellationCode: bookingToCancel.cancellationCode });
            setSuccess(t('generated.pages_citizen_MyBookings_jsx_47_72cb6b26'));
            setBookingToCancel(null);
            fetchBookings();
        } catch (err) { 
            setError(err.response?.data?.Detailed || t('generated.pages_citizen_MyBookings_jsx_51_7d4ac1e7')); 
        }
    };

    const resolveTripId = (booking) => {
        return booking.tripId || booking.trip?.id || booking.trip?.tripId || booking.trip?.trip?.id || null;
    };

    const openEmergencyModal = (booking) => {
        const tripId = resolveTripId(booking);
        if (!tripId) {
            setError('Unable to determine the associated trip for this booking.');
            return;
        }

        setSelectedBooking(booking);
        setEmergencyForm({ type: 'Medical', priority: 'High', description: '' });
        setError('');
        setSuccess('');
        setEmergencyModalOpen(true);
    };

    const submitEmergency = async () => {
        if (!selectedBooking) return;

        const tripId = resolveTripId(selectedBooking);
        if (!tripId) {
            setError('Unable to determine the associated trip for this booking.');
            return;
        }

        try {
            await createEmergency({
                tripId,
                bookingId: selectedBooking.id,
                type: emergencyForm.type,
                priority: emergencyForm.priority,
                description: emergencyForm.description
            }, { skipAuthRedirect: true });
            setSuccess(t('emergency.success','Emergency reported successfully.'));
            setEmergencyModalOpen(false);
            setSelectedBooking(null);
            setEmergencyForm({ type: 'Medical', priority: 'High', description: '' });
            fetchBookings();
        } catch (err) {
            setError(err.response?.data?.Detailed || t('emergency.failed','Unable to report the emergency. Please try again.'));
            console.error(err);
        }
    };

    const renderBookingCard = (booking, showCancellationCode = true) => {
        const tripStatus = booking.tripStatus || 'Unknown';
        const tripStatusLabel = translateTripStatus(tripStatus);
        const normalizedTripStatus = tripStatus.trim().toLowerCase();
        const canReportEmergency = activeTab === 'active' && normalizedTripStatus === 'started';
        const canCancelReservation = activeTab === 'active' && booking.cancellationCode && normalizedTripStatus !== 'started';
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
                        {/* Vehicle Transit State Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${statusColors[tripStatus] || 'bg-[var(--surface-muted)] text-muted'}`}>
                            {tripStatusLabel}
                        </span>

                        {canReportEmergency && (
                            <button
                                onClick={() => openEmergencyModal(booking)}
                                className="mt-2 px-3 py-1.5 danger-button   rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all"
                            >
                                {t('citizen.myBookings.reportEmergency','Report Emergency')}
                            </button>
                        )}
                        {canCancelReservation && (
                            <button
                                onClick={() => setBookingToCancel(booking)}
                                className="mt-2 px-3 py-1.5 danger-button rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all"
                            >
                                {t('generated.pages_citizen_MyBookings_jsx_179_b3e7c0ad1')}
                            </button>
                        )}
                        {booking.qrToken && (
                            <button
                                onClick={() => setQrModalBooking(booking)}
                                className="mt-2 px-3 py-1.5 secondary-button rounded-[var(--radius-sm)] text-xs font-semibold shadow-sm transition-all"
                            >
                                {t('citizen.qr.viewQr','View QR')}
                            </button>
                        )}
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

    const historyFinishedBookings = historyBookings
        .filter((booking) => (booking.tripStatus || '').trim().toLowerCase() === 'finished')
        .sort((a, b) => new Date(b.tripDepartureTimeUtc) - new Date(a.tripDepartureTimeUtc))
        .slice(0, 10);

    const currentBookings = activeTab === 'active' ? activeBookings : historyFinishedBookings;

    const filteredBookings = currentBookings.filter(booking => {
        const matchesBookedDate = !filters.bookedDate || new Date(booking.bookedAt).toLocaleDateString().includes(filters.bookedDate);
        const matchesDepartureDate = !filters.departureDate || new Date(booking.tripDepartureTimeUtc).toLocaleDateString().includes(filters.departureDate);
        const matchesSeatCount = !filters.seatCount || (booking.seatCount ?? 1).toString().includes(filters.seatCount);
        return matchesBookedDate && matchesDepartureDate && matchesSeatCount;
    });

    return (
        <>
            <EmergencyReportModal
                open={isEmergencyModalOpen}
                title="Report an Emergency"
                tripLabel={selectedBooking ? `Booking ${selectedBooking.id}` : ''}
                type={emergencyForm.type}
                priority={emergencyForm.priority}
                description={emergencyForm.description}
                error={error}
                onChange={(field, value) => setEmergencyForm(prev => ({ ...prev, [field]: value }))}
                onSubmit={submitEmergency}
                onClose={() => setEmergencyModalOpen(false)}
            />
            <ConfirmationModal
                open={!!bookingToCancel}
                title={t('citizen.myBookings.cancelReservationTitle', 'Cancel reservation')}
                message={t(
                    'citizen.myBookings.cancelReservationMessage',
                    'Are you sure you want to cancel this booking?'
                )}
                confirmText={t('generated.pages_citizen_MyBookings_jsx_179_b3e7c0ad1')}
                cancelText={t('common.cancel')}
                danger
                onConfirm={confirmCancelBooking}
                onCancel={() => setBookingToCancel(null)}
            />
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
                    {t('generated.pages_citizen_MyBookings_jsx_127_8abd2d99', { count: historyFinishedBookings.length })}
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

            {/* Main Dynamic Result Grid Content */}
            <div className="grid gap-4">
                {filteredBookings.map(booking => renderBookingCard(booking, activeTab === 'active'))}
                
                {filteredBookings.length === 0 && (
                    <p className="text-center text-muted py-12 card bg-surface-muted">
                        {currentBookings.length === 0 
                            ? (activeTab === 'active' ? t('generated.pages_citizen_MyBookings_jsx_183_5fcbc5e3') : t('generated.pages_citizen_MyBookings_jsx_183_5fcbc5e3_history'))
                            : t('generated.pages_citizen_MyBookings_jsx_185_0b1fa2a41')
                        }
                    </p>
                )}
            </div>
            {/* QR Modal */}
            {qrModalBooking && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-[320px]">
                        <h3 className="font-semibold mb-3">QR</h3>
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-2 bg-white" id={`qr-wrapper-${qrModalBooking.id}`}>
                                <QRCode value={qrModalBooking.qrToken || ''} size={256} />
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    type="button"
                                    className="secondary-button px-3 py-1 text-sm"
                                    onClick={() => {
                                        try {
                                            const wrapper = document.getElementById(`qr-wrapper-${qrModalBooking.id}`);
                                            if (!wrapper) throw new Error('QR element not found');
                                            const svg = wrapper.querySelector('svg');
                                            if (!svg) throw new Error('SVG not found');

                                            const serializer = new XMLSerializer();
                                            const svgString = serializer.serializeToString(svg);
                                            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                                            const url = URL.createObjectURL(svgBlob);
                                            const img = new Image();
                                            img.onload = () => {
                                                const canvas = document.createElement('canvas');
                                                canvas.width = img.width;
                                                canvas.height = img.height;
                                                const ctx = canvas.getContext('2d');
                                                ctx.fillStyle = '#ffffff';
                                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                                ctx.drawImage(img, 0, 0);
                                                URL.revokeObjectURL(url);
                                                const dataUrl = canvas.toDataURL('image/png');
                                                const a = document.createElement('a');
                                                a.href = dataUrl;
                                                a.download = `qr_${qrModalBooking.id}.png`;
                                                document.body.appendChild(a);
                                                a.click();
                                                a.remove();
                                            };
                                            img.onerror = () => { throw new Error('Failed to rasterize SVG'); };
                                            img.src = url;
                                        } catch (err) {
                                            setError(t('citizen.qr.download_failed', 'Failed to download image'));
                                            setTimeout(() => setError(''), 2000);
                                        }
                                    }}
                                >
                                    {t('common.download')}
                                </button>

                                <button className="primary-button" onClick={() => setQrModalBooking(null)}>{t('common.close')}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
}