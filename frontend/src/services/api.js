import axios from 'axios';
import API_BASE from '../config';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;

            if (status === 401 || status === 403) {
                console.warn(`Auth error ${status}:`, error.response.data || error.response.statusText);

                // Remove stale token / user from storage, and trigger re-auth
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.dispatchEvent(new CustomEvent('auth-error', { detail: { status, data: error.response.data }}));

                // If app is in UI, redirect to login (optional behavior)
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        // Pass error up so calling code can handle it appropriately
        return Promise.reject(error);
    }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Routes
export const getRoutes = () => api.get('/route');
export const getRoute = (id) => api.get(`/route/${id}`);
export const createRoute = (data) => api.post('/route', data);
export const updateRoute = (id, data) => api.put(`/route/${id}`, data);
export const deleteRoute = (id) => api.delete(`/route/${id}`);

// Trips
export const getTrips = () => api.get('/trip');
export const getTrip = (id) => api.get(`/trip/${id}`);

// Vehicles
export const getVehicles = () => api.get('/vehicle');
export const getVehicle = (id) => api.get(`/vehicle/${id}`);
export const createVehicle = (data) => api.post('/vehicle', data);
export const updateVehicle = (id, data) => api.put(`/vehicle/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicle/${id}`);
export const getDriverTrips = (driverId) => api.get(`/trip/driver/${driverId}`);
export const getTripsByRoute = (routeId) => api.get(`/trip/route/${routeId}`);
export const getActiveTips = () => api.get('/trip/active');
export const getTripHistory = (daysBack = 7) => api.get(`/trip/history?days=${daysBack}`);
export const getDriverTripHistory = (driverId, daysBack = 7) => api.get(`/trip/driver/${driverId}/history?days=${daysBack}`);
export const createTrip = (data) => api.post('/trip', data);
export const updateTrip = (id, data) => api.put(`/trip/${id}`, data);
export const updateTripStatus = (id, data) => api.patch(`/trip/${id}/status`, data);
export const deleteTrip = (id) => api.delete(`/trip/${id}`);

// Users (AuthService)
export const getUsers = (role) => api.get(`/users${role ? `?role=${encodeURIComponent(role)}` : ''}`);
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const getMyProfile = () => api.get('/users/me');
export const updateMyProfile = (data) => api.put('/users/me', data);

export const getDrivers = () => api.get('/users/drivers');
export const createDriver = (data) => api.post('/users/drivers', data);
export const updateDriver = (id, data) => api.put(`/users/drivers/${id}`, data);
export const deleteDriver = (id) => api.delete(`/users/drivers/${id}`);

// Bookings
export const getBookings = () => api.get('/booking');
export const getMyBookings = () => api.get('/booking/my');
export const getMyActiveBookings = () => api.get('/booking/my/active');
export const getMyBookingHistory = () => api.get('/booking/my/history');
export const createBooking = (data) => api.post('/booking', data);
export const cancelBooking = (data) => api.post('/booking/cancel', data);

// Complaints
export const getComplaints = () => api.get('/complaint');
export const getMyComplaints = () => api.get('/complaint/my');
export const createComplaint = (data) => api.post('/complaint', data);
export const updateComplaintStatus = (id, data) => api.patch(`/complaint/${id}/status`, data);
export const respondToComplaint = (id, data) => api.patch(`/complaint/${id}/respond`, data);

// Notifications
export const getMyNotifications = () => api.get('/notification/my');
export const getNotification = (id) => api.get(`/notification/${id}`);
export const markNotificationAsRead = (id) => api.patch(`/notification/${id}/read`);
export const markAllNotificationsAsRead = () => api.patch('/notification/read-all');

// Driver Profile
export const getMyDriverProfile = () => api.get('/driver/profile/me');
export const getDriverProfile = (driverId) => api.get(`/driver/profile/${driverId}`);
export const getAllDriverProfiles = () => api.get('/driver/profile/admin/all');
export const createDriverProfile = (data) => api.post('/driver/profile', data);

// Favorites
export const addToFavorites = (trip) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.some(f => f.id === trip.id)) {
        favorites.push({ ...trip, route: trip.route || {} });
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    return Promise.resolve({ data: favorites });
};

export const removeFromFavorites = (tripId) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updated = favorites.filter(f => f.id !== tripId);
    localStorage.setItem('favorites', JSON.stringify(updated));
    return Promise.resolve({ data: updated });
};

export const getMyFavorites = async () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    // Validate that trips still exist
    const validatedFavorites = [];
    for (const trip of favorites) {
        try {
            await getTrip(trip.id);
            validatedFavorites.push(trip);
        } catch {
            // Trip no longer exists, remove from favorites
            removeFromFavorites(trip.id);
        }
    }
    return { data: validatedFavorites };
};
export const updateMyDriverProfile = (data) => api.put('/driver/profile/me', data);
export const updateDriverProfile = (driverId, data) => api.put(`/driver/profile/${driverId}`, data);
export const deleteMyDriverProfile = () => api.delete('/driver/profile/me');

// Driver Change Requests
export const submitChangeRequest = (data) => api.post('/driver/change-requests', data);
export const getMyChangeRequests = () => api.get('/driver/change-requests/my');
export const getChangeRequest = (requestId) => api.get(`/driver/change-requests/${requestId}`);
export const getAllChangeRequests = () => api.get('/driver/change-requests');
export const updateChangeRequestStatus = (requestId, data) => api.patch(`/driver/change-requests/${requestId}/status`, data);

// Admin Trip Details
export const getTripDetails = (tripId) => api.get(`/admin/trips/${tripId}/details`);

// Admin Contact
export const getAdminContact = async () => {
    try {
        const response = await api.get('/users/admin-contact');
        const contact = response.data;
        return `${contact.phone || ''} ${contact.email || ''}`.trim();
    } catch (error) {
        console.error('Failed to fetch admin contact:', error);
        return '';
    }
};

export default api;
