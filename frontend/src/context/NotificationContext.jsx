import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const pollingIntervalRef = useRef(null);
    const isMountedRef = useRef(true);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // No auth token (likely not logged in yet)
            return;
        }

        try {
            setLoading(true);
            const response = await getMyNotifications();
            if (isMountedRef.current) {
                const data = Array.isArray(response.data) ? response.data : response.data.$values || [];
                setNotifications(data);
                const unread = data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
                setError(null);
            }
        } catch (err) {
            if (isMountedRef.current) {
                console.error('Failed to fetch notifications:', err);
                setError('Failed to load notifications');
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await markNotificationAsRead(notificationId);
            if (isMountedRef.current) {
                setNotifications(prev =>
                    prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await markAllNotificationsAsRead();
            if (isMountedRef.current) {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    }, []);

    // Initialize notifications on mount (only if token exists)
    useEffect(() => {
        const attemptFetch = () => {
            const token = localStorage.getItem('token');
            if (token) fetchNotifications();
        };

        attemptFetch();

        // Also refresh when auth token changes (login/logout)
        const handleTokenChange = () => attemptFetch();
        window.addEventListener('auth-token-changed', handleTokenChange);

        return () => {
            window.removeEventListener('auth-token-changed', handleTokenChange);
        };
    }, [fetchNotifications]);

    // Set up polling (every 30 seconds) while user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        pollingIntervalRef.current = setInterval(fetchNotifications, 30000);

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [fetchNotifications]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
