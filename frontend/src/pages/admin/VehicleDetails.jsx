import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicle } from '../../services/api';

export default function VehicleDetails() {
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
                setError(err.response?.data?.message || 'Failed to load vehicle details');
            } finally {
                setLoading(false);
            }
        };

        if (vehicleId) fetchVehicle();
    }, [vehicleId]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
    if (error) return <div className="text-center py-10 text-red-400">{error}</div>;
    if (!vehicle) return <div className="text-center py-10 text-red-400">Vehicle not found</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Vehicle Details</h1>
                <button onClick={() => navigate('/admin/vehicles')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm transition-colors">Back to Vehicles</button>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                <div className="grid gap-4">
                    <div><span className="text-slate-400 text-sm">Name:</span><p className="text-white font-semibold">{vehicle.name}</p></div>
                    <div><span className="text-slate-400 text-sm">Type:</span><p className="text-white">{vehicle.type}</p></div>
                    <div><span className="text-slate-400 text-sm">Plate Number:</span><p className="text-white">{vehicle.plateNumber}</p></div>
                    <div><span className="text-slate-400 text-sm">Capacity:</span><p className="text-white">{vehicle.capacity}</p></div>
                    <div><span className="text-slate-400 text-sm">Status:</span><p className="text-white">{vehicle.status}</p></div>
                    <div><span className="text-slate-400 text-sm">Created At:</span><p className="text-white">{new Date(vehicle.createdAt).toLocaleString()}</p></div>
                    {vehicle.updatedAt && <div><span className="text-slate-400 text-sm">Updated At:</span><p className="text-white">{new Date(vehicle.updatedAt).toLocaleString()}</p></div>}
                    <div><span className="text-slate-400 text-sm">Additional Info:</span><p className="text-white">{vehicle.description || 'No additional details available.'}</p></div>
                </div>
            </div>
        </div>
    );
}
