import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoute } from '../../services/api';
import { useTranslation } from 'react-i18next';

export default function RouteDetails() {
    const { t } = useTranslation();
    const { routeId } = useParams();
    const navigate = useNavigate();
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRoute = async () => {
            try {
                const { data } = await getRoute(routeId);
                setRoute(data);
            } catch (err) {
                setError(err.response?.data?.message || t('generated.pages_admin_RouteDetails_load_failed'));
            } finally {
                setLoading(false);
            }
        };

        if (routeId) fetchRoute();
    }, [routeId]);

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

    if (!route) {
        return (
            <div className="content-wrapper py-6">
                <div className="alert alert-error max-w-xl mx-auto text-center">
                    {t('generated.pages_admin_RouteDetails_jsx_29_7f825c64')}
                </div>
            </div>
        );
    }

    return (
        <div className="content-wrapper py-6">
            {/* Header Title and Control Panel */}
            <div className="flex items-center justify-between mb-6 gap-4">
                <h1 style={{margin:'20px 0'}} className="text-2xl font-bold text-[var(--charcoal)]">
                    {t('generated.pages_admin_RouteDetails_jsx_34_5be1fdd8')}
                </h1>
                <button
                    onClick={() => navigate('/admin/routes')}
                    className="px-4 py-2 bg-[var(--surface-soft)] hover:bg-[var(--surface-muted)] text-[var(--charcoal-medium)] border border-[rgba(66,129,119,0.15)] rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                    {t('generated.pages_admin_RouteDetails_backToRoutes')}
                </button>
            </div>

            {/* Core Route Specification Summary Deck */}
            <div className="card p-6 border border-[rgba(66,129,119,0.1)]">
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                    
                    <div className="space-y-1 sm:col-span-2">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block">
                            {t('generated.pages_admin_RouteDetails_jsx_46_f1e28a20')}
                        </span>
                        <p className="text-[var(--charcoal)] font-bold text-lg">
                            {route.name}
                        </p>
                    </div>

                    <div className="space-y-1 p-3 bg-[var(--surface-soft)] rounded-xl border border-[rgba(66,129,119,0.04)]">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">
                            {t('generated.pages_admin_RouteDetails_jsx_50_f82a5fe0')}
                        </span>
                        <p className="text-[var(--charcoal-medium)] font-medium text-sm">
                             {route.startLocation}
                        </p>
                    </div>

                    <div className="space-y-1 p-3 bg-[var(--surface-soft)] rounded-xl border border-[rgba(66,129,119,0.04)]">
                        <span className="text-muted text-xs font-semibold uppercase tracking-wider block mb-0.5">
                            {t('generated.pages_admin_RouteDetails_jsx_54_7fbb1d78')}
                        </span>
                        <p className="text-[var(--charcoal-medium)] font-medium text-sm">
                             {route.endLocation}
                        </p>
                    </div>

                    <div className="sm:col-span-2 grid grid-cols-2 gap-4 pt-3 border-t border-[rgba(66,129,119,0.06)]">
                        <div className="space-y-1">
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block">
                                {t('generated.pages_admin_RouteDetails_jsx_59_3fdda58e')}
                            </span>
                            <p className="text-[var(--charcoal)] font-extrabold text-xl">
                                {route.distanceKm} <span className="text-xs font-medium text-muted">km</span>
                            </p>
                        </div>
                        
                        <div className="space-y-1">
                            <span className="text-muted text-xs font-semibold uppercase tracking-wider block">
                                {t('generated.pages_admin_RouteDetails_jsx_63_33cfb6d5')}
                            </span>
                            <p className="text-[var(--charcoal)] font-extrabold text-xl">
                                {route.estimatedDurationMins} <span className="text-xs font-medium text-muted">mins</span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}