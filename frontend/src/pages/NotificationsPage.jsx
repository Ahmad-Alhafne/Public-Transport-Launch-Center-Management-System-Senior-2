import React, { useContext, useState} from 'react';
import { NotificationContext } from '../context/NotificationContext';

const NotificationsPage = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useContext(NotificationContext);
    const [filter, setFilter] = useState('all'); // all, unread, read

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'read') return notification.isRead;
        return true;
    });

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Notifications</h1>
                <p className="text-slate-400">You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'unread'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    Unread ({unreadCount})
                </button>
                <button
                    onClick={() => setFilter('read')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === 'read'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }`}
                >
                    Read ({notifications.filter(n => n.isRead).length})
                </button>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="ml-auto px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-600/30 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="grid gap-4">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`rounded-lg border p-6 cursor-pointer transition-all ${
                                notification.isRead
                                    ? 'bg-slate-800/30 border-slate-700/30'
                                    : 'bg-blue-950/20 border-blue-700/30 hover:bg-blue-950/30'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Unread Indicator */}
                                {!notification.isRead && (
                                    <div className="flex-shrink-0 mt-2">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                    </div>
                                )}

                                {/* Notification Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-white">
                                                {notification.title}
                                            </h3>
                                            <p className="text-slate-400 mt-2 whitespace-pre-wrap">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-3 py-1 rounded-full flex-shrink-0 ${
                                            notification.isRead
                                                ? 'bg-slate-700/50 text-slate-400'
                                                : 'bg-blue-600/20 text-blue-400'
                                        }`}>
                                            {notification.isRead ? 'Read' : 'Unread'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-3">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-lg">
                            {filter === 'unread' && 'No unread notifications'}
                            {filter === 'read' && 'No read notifications'}
                            {filter === 'all' && 'No notifications yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
