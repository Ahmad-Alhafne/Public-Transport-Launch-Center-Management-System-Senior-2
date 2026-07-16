import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicle } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function VehicleDetails() {
    const { t } = useTranslation();
    const { vehicleId } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const { data } = await getVehicle(vehicleId);
                setVehicle(data);
            } catch (err) {
                setError(err.response?.data?.message || t('generated.pages_admin_VehicleDetails_load_failed'));
            } finally {
                setLoading(false);
            }
        };

        if (vehicleId) fetchVehicle();
    }, [vehicleId]);

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

    if (!vehicle) {
        return (
            <div className="content-wrapper py-6">
                <div className="alert alert-error max-w-xl mx-auto text-center">
                    {t('generated.pages_admin_VehicleDetails_jsx_29_6e96578c')}
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper py-6">
            {/* Header Control Panel Section */}
            <div className="flex items-center justify-between mb-6 gap-4">
                <h1 style={{margin:'20px 0'}} className="text-2xl font-bold text-[var(--charcoal)]">
                    {t('generated.pages_admin_VehicleDetails_jsx_34_ef6dde72')}
                </h1>
                <button 
                    onClick={() => navigate('/admin/vehicles')} 
                    className="px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border border-[rgba(66,129,119,0.15)] rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                    {t('generated.pages_admin_VehicleDetails_jsx_35_f32a7b15')}
                </button>
            </div>

            {/* Core Profile Parameters Deck */}
            <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    
                    <div className="space-y-1">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block">{t('generated.pages_admin_VehicleDetails_jsx_39_71dd2eff')}</span>
                        <p className="text-[var(--charcoal)] font-bold text-base">{vehicle.name}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block">{t('generated.pages_admin_VehicleDetails_jsx_40_ee3fb11d')}</span>
                        <p className="text-[var(--charcoal-medium)] font-medium text-sm">{vehicle.type}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block">{t('generated.pages_admin_VehicleDetails_jsx_41_e2fde541')}</span>
                        <p className="font-mono bg-[var(--surface-muted)] px-2 py-0.5 border border-[rgba(66,129,119,0.08)] rounded text-xs font-bold text-[var(--charcoal)] inline-block">{vehicle.plateNumber}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block">{t('generated.pages_admin_VehicleDetails_jsx_42_218347e0')}</span>
                        <p className="text-[var(--charcoal-medium)] text-sm font-medium">💺 {vehicle.capacity}</p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block">{t('generated.pages_admin_VehicleDetails_jsx_43_11dc9e19')}</span>
                        <p className="text-sm font-medium">
                            <span className="font-medium text-[var(--forest-dark)] bg-[var(--forest-100)] px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                                {vehicle.status ? t(`profile.status${vehicle.status.charAt(0).toUpperCase()}${vehicle.status.slice(1).toLowerCase()}`, vehicle.status) : '-'}
                            </span>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block">{t('generated.pages_admin_VehicleDetails_jsx_44_955fd51b')}</span>
                        <p className="text-[var(--charcoal-medium)] text-sm">{new Date(vehicle.createdAt).toLocaleString()}</p>
                    </div>

                    {vehicle.updatedAt && (
                        <div className="space-y-1">
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block">{t('generated.pages_admin_VehicleDetails_jsx_45_b7c4551d')}</span>
                            <p className="text-[var(--charcoal-medium)] text-sm">{new Date(vehicle.updatedAt).toLocaleString()}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}