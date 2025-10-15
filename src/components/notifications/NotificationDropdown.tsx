'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { notificationsService, Notification } from '@/lib/api/notifications';
import Link from 'next/link';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getCorrectActionUrl = (notification: Notification): string | null => {
    if (!notification.actionUrl) return null;

    // Fix old notification URLs that point to /investor/investments/:id
    // Redirect them to /investor/portfolio instead
    if (notification.actionUrl.includes('/investor/investments/')) {
      return '/investor/portfolio';
    }

    return notification.actionUrl;
  };

  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await notificationsService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === id);
        return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    if (type === 'PROJECT_REJECTED') {
      return <AlertCircle className="text-red-500" size={20} />;
    }
    if (type === 'PROJECT_APPROVED' || type === 'INVESTMENT_APPROVED') {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    if (priority === 'HIGH' || priority === 'URGENT') {
      return <AlertCircle className="text-orange-500" size={20} />;
    }
    return <Info className="text-blue-500" size={20} />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="text-white" size={20} />
                  <h3 className="text-lg font-bold text-white">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-white/20 text-white text-xs font-semibold rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 text-sm">Chưa có thông báo</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const actionUrl = getCorrectActionUrl(notification);
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        {actionUrl ? (
                          <Link
                            href={actionUrl}
                            onClick={() => {
                              handleMarkAsRead(notification.id);
                              setIsOpen(false);
                            }}
                            className="block"
                          >
                            <NotificationItem
                              notification={notification}
                              getNotificationIcon={getNotificationIcon}
                              formatTime={formatTime}
                              onDelete={handleDeleteNotification}
                              onMarkAsRead={handleMarkAsRead}
                            />
                          </Link>
                        ) : (
                          <NotificationItem
                            notification={notification}
                            getNotificationIcon={getNotificationIcon}
                            formatTime={formatTime}
                            onDelete={handleDeleteNotification}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => {
                    // Mark all as read
                    notifications.forEach(n => {
                      if (!n.isRead) {
                        handleMarkAsRead(n.id);
                      }
                    });
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Separate component for notification item to avoid repetition
function NotificationItem({
  notification,
  getNotificationIcon,
  formatTime,
  onDelete,
  onMarkAsRead,
}: {
  notification: Notification;
  getNotificationIcon: (type: string, priority: string) => React.ReactElement;
  formatTime: (dateString: string) => string;
  onDelete: (id: number, e: React.MouseEvent) => void;
  onMarkAsRead: (id: number) => void;
}) {
  return (
    <div className="flex gap-3">
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type, notification.priority)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span className="flex-shrink-0 h-2 w-2 bg-blue-600 rounded-full"></span>
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {notification.message}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatTime(notification.createdAt)}
          </span>
          <div className="flex items-center gap-1">
            {!notification.isRead && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                title="Đánh dấu đã đọc"
              >
                <Check size={14} />
              </button>
            )}
            <button
              onClick={(e) => onDelete(notification.id, e)}
              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
              title="Xóa"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
