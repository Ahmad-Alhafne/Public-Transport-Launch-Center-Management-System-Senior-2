import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ManageRoutes from './pages/admin/ManageRoutes';
import ManageTrips from './pages/admin/ManageTrips';
import ManageVehicles from './pages/admin/ManageVehicles';
import ManageDrivers from './pages/admin/ManageDrivers';
import ManageDriversDetails from './pages/admin/ManageDriversDetails';
import ManageUsers from './pages/admin/ManageUsers';
import VehicleDetails from './pages/admin/VehicleDetails';
import ManageUsersDetails from './pages/admin/ManageUsersDetails';
import TripDetails from './pages/admin/TripDetails';
import RouteDetails from './pages/admin/RouteDetails';
import AdminProfile from './pages/admin/AdminProfile';
import ViewComplaints from './pages/admin/ViewComplaints';
import DriverTrips from './pages/driver/DriverTrips';
import DriverProfile from './pages/driver/DriverProfile';
import CitizenTrips from './pages/citizen/CitizenTrips';
import MyBookings from './pages/citizen/MyBookings';
import SubmitComplaint from './pages/citizen/SubmitComplaint';
import DriverSubmitComplaint from './pages/driver/SubmitComplaint';
import MyProfile from './pages/citizen/MyProfile';
import FavoriteTrips from './pages/citizen/FavoriteTrips';
import NotificationsPage from './pages/NotificationsPage';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin */}
            <Route path="/admin/routes" element={
              <ProtectedRoute roles={['Admin']}><ManageRoutes /></ProtectedRoute>
            } />
            <Route path="/admin/routes/:routeId" element={
              <ProtectedRoute roles={['Admin']}><RouteDetails /></ProtectedRoute>
            } />
            <Route path="/admin/trips" element={
              <ProtectedRoute roles={['Admin']}><ManageTrips /></ProtectedRoute>
            } />
            <Route path="/admin/trips/:tripId" element={
              <ProtectedRoute roles={['Admin']}><TripDetails /></ProtectedRoute>
            } />
            <Route path="/admin/drivers" element={
              <ProtectedRoute roles={['Admin']}><ManageDrivers /></ProtectedRoute>
            } />
            <Route path="/admin/drivers/:id" element={
              <ProtectedRoute roles={['Admin']}><ManageDriversDetails /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={['Admin']}><ManageUsers /></ProtectedRoute>
            } />
            <Route path="/admin/users/:id" element={
              <ProtectedRoute roles={['Admin']}><ManageUsersDetails /></ProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <ProtectedRoute roles={['Admin']}><AdminProfile /></ProtectedRoute>
            } />
            <Route path="/admin/complaints" element={
              <ProtectedRoute roles={['Admin']}><ViewComplaints /></ProtectedRoute>
            } />
            <Route path="/admin/vehicles" element={
              <ProtectedRoute roles={['Admin']}><ManageVehicles /></ProtectedRoute>
            } />
            <Route path="/admin/vehicles/:vehicleId" element={
              <ProtectedRoute roles={['Admin']}><VehicleDetails /></ProtectedRoute>
            } />

            {/* Driver */}
            <Route path="/driver/profile" element={
              <ProtectedRoute roles={['Driver']}><DriverProfile /></ProtectedRoute>
            } />
            <Route path="/driver/trips" element={
              <ProtectedRoute roles={['Driver']}><DriverTrips /></ProtectedRoute>
            } />
            <Route path="/driver/complaints" element={
              <ProtectedRoute roles={['Driver']}><DriverSubmitComplaint /></ProtectedRoute>
            } />

            {/* Citizen */}
            <Route path="/citizen/profile" element={
              <ProtectedRoute roles={['Citizen']}><MyProfile /></ProtectedRoute>
            } />
            <Route path="/citizen/trips" element={
              <ProtectedRoute roles={['Citizen']}><CitizenTrips /></ProtectedRoute>
            } />
            <Route path="/citizen/favorites" element={
              <ProtectedRoute roles={['Citizen']}><FavoriteTrips /></ProtectedRoute>
            } />
            <Route path="/citizen/bookings" element={
              <ProtectedRoute roles={['Citizen']}><MyBookings /></ProtectedRoute>
            } />
            <Route path="/citizen/complaints" element={
              <ProtectedRoute roles={['Citizen', 'Driver']}><SubmitComplaint /></ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
