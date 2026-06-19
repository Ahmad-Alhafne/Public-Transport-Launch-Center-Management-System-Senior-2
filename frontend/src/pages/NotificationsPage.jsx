import React, { useContext, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { useTranslation } from 'react-i18next';

const NotificationsPage = () => {
    const { t } = useTranslation();    
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useContext(NotificationContext);
    const [filter, setFilter] = useState('all'); // all, unread, read

    // Format title to replace backend hardcoded English/Arabic fragments with translations
    const formatNotificationTitle = (notification, t) => {
        if (!notification) return '';
        let title = notification.title || '';
        try {
            title = title.replace(/Complaint Update:/i, t('notifications.complaintUpdatePrefix'));
            title = title.replace(/بلاغ:/i, t('notifications.complaintUpdatePrefix'));
        } catch (e) {
            // fallback: leave title as-is
        }
        return title;
    };

    // Format message to replace known hardcoded fragments
    const formatNotificationMessage = (notification, t) => {
        if (!notification) return '';
        let msg = notification.message || '';
        try {
            msg = msg.replace(/Your complaint has been resolved\.\s*Admin response:/i, t('notifications.complaintResolvedAdminResponsePrefix'));
            msg = msg.replace(/تم حل شكواك\.\s*رد المسؤول:/i, t('notifications.complaintResolvedAdminResponsePrefix'));
            // replace any literal Read/Unread words that may have been embedded
            msg = msg.replace(/\bRead\b/g, t('generated.pages_NotificationsPage_status_read'));
            msg = msg.replace(/\bUnread\b/g, t('generated.pages_NotificationsPage_status_unread'));
            msg = msg.replace(/مقروء/g, t('generated.pages_NotificationsPage_status_read'));
            msg = msg.replace(/غير مقروء/g, t('generated.pages_NotificationsPage_status_unread'));
        } catch (e) {
            // leave original message
        }
        return msg;
    };

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
            <div className="flex justify-center items-center py-20 min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--forest)' }}></div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center px-4 py-8">
            <div className="w-full max-w-2xl">
                
                {/* Header Section */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--charcoal)' }}>
                            {t('generated.pages_NotificationsPage_jsx_31_753a22b2')}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {t('generated.pages_NotificationsPage_you_have', { count: unreadCount })}
                        </p>
                    </div>
                    
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 text-sm font-semibold transition-all duration-200 self-start sm:self-auto shrink-0"
                            style={{ 
                                color: 'var(--forest-dark)', 
                                backgroundColor: 'rgba(66, 129, 119, 0.08)',
                                borderRadius: 'var(--radius-sm)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 129, 119, 0.14)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 129, 119, 0.08)'}
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6 p-1.5 rounded-xl" style={{ backgroundColor: 'var(--surface-muted)' }}>
                    <button
                        onClick={() => setFilter('all')}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={filter === 'all' ? {
                            backgroundColor: 'var(--forest)',
                            color: 'var(--surface)',
                            boxShadow: '0 4px 12px rgba(66, 129, 119, 0.15)'
                        } : {
                            color: 'var(--charcoal-medium)'
                        }}
                    >
                        {t('generated.pages_NotificationsPage_filter_all')}
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={filter === 'unread' ? {
                            backgroundColor: 'var(--forest)',
                            color: 'var(--surface)',
                            boxShadow: '0 4px 12px rgba(66, 129, 119, 0.15)'
                        } : {
                            color: 'var(--charcoal-medium)'
                        }}
                    >
                        {t('generated.pages_NotificationsPage_filter_unread', { count: unreadCount })}
                    </button>
                    <button
                        onClick={() => setFilter('read')}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                        style={filter === 'read' ? {
                            backgroundColor: 'var(--forest)',
                            color: 'var(--surface)',
                            boxShadow: '0 4px 12px rgba(66, 129, 119, 0.15)'
                        } : {
                            color: 'var(--charcoal-medium)'
                        }}
                    >
                        {t('generated.pages_NotificationsPage_filter_read', { count: notifications.filter(n => n.isRead).length })}
                    </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className="card notification-item p-5 cursor-pointer transition-all duration-200"
                                style={{
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid rgba(66, 129, 119, 0.08)',
                                    backgroundColor: notification.isRead ? 'var(--surface)' : 'var(--surface-soft)',
                                    boxShadow: notification.isRead ? 'none' : 'var(--shadow)'
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Unread Status Dot Indicator */}
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0 mt-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--forest)' }}></div>
                                        </div>
                                    )}

                                    {/* Notification Content Body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold leading-snug" style={{ color: 'var(--charcoal)' }}>
                                                    {formatNotificationTitle(notification, t)}
                                                </h3>
                                                <p className="mt-1.5 text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                                    {formatNotificationMessage(notification, t)}
                                                </p>
                                            </div>
                                            
                                            {/* Dynamic Status Badge */}
                                            <span 
                                                className="text-xs font-semibold px-2.5 py-1 rounded-full self-start shrink-0"
                                                style={notification.isRead ? {
                                                    backgroundColor: 'var(--surface-muted)',
                                                    color: 'var(--charcoal-medium)'
                                                } : {
                                                    backgroundColor: 'var(--forest-100)',
                                                    color: 'var(--forest-dark)'
                                                }}
                                            >
                                                {notification.isRead ? t('generated.pages_NotificationsPage_status_read') : t('generated.pages_NotificationsPage_status_unread')}
                                            </span>
                                        </div>
                                        
                                        {/* Timestamp */}
                                        <p className="text-xs mt-3 font-medium" style={{ color: 'var(--wheat-dark)' }}>
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        /* Empty State Dashboard Illustration Container */
                        <div className="text-center py-16 card" style={{ backgroundColor: 'var(--surface)' }}>
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-soft)' }}>
                                <svg className="w-8 h-8" style={{ color: 'var(--wheat)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <p className="text-base font-medium" style={{ color: 'var(--charcoal-medium)' }}>
                                {filter === 'unread' && t('generated.pages_NotificationsPage_empty_unread')}
                                {filter === 'read' && t('generated.pages_NotificationsPage_empty_read')}
                                {filter === 'all' && t('generated.pages_NotificationsPage_empty_all')}
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default NotificationsPage;