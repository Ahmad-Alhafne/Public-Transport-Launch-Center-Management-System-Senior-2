import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoute } from '../../services/api';

export default function RouteDetails() {
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
                setError(err.response?.data?.message || 'Failed to load route details');
            } finally {
                setLoading(false);
            }
        };

        if (routeId) fetchRoute();
    }, [routeId]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-center py-10 text-red-400">{error}</div>;
    if (!route) return <div className="text-center py-10 text-red-400">Route not found</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Route Details</h1>
                <button
                    onClick={() => navigate('/admin/routes')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors"
                >
                    Back to Routes
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="grid gap-4">
                    <div>
                        <span className="text-slate-400 text-sm">Route Name:</span>
                        <p className="text-white font-semibold">{route.name}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">Start Location:</span>
                        <p className="text-white">{route.startLocation}</p>
                    </div>
                    <div>
                        <span className="text-slate-400 text-sm">End Location:</span>
                        <p className="text-white">{route.endLocation}</p>
                    </div>
                    <div className="flex gap-6">
                        <div>
                            <span className="text-slate-400 text-sm">Distance (km):</span>
                            <p className="text-white">{route.distanceKm}</p>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm">Estimated Duration (mins):</span>
                            <p className="text-white">{route.estimatedDurationMins}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
