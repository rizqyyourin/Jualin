'use client';

import { useNotificationStore } from '@/lib/stores/notificationStore';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const NOTIFICATION_DURATION = 5000;

function NotificationItem({ notification, onRemove }: { notification: any, onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const startTime = Date.now();
      const endTime = startTime + notification.duration;

      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const percentage = (remaining / notification.duration) * 100;
        setProgress(percentage);

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 16);

      return () => clearInterval(interval);
    }
  }, [notification]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Wait for exit animation
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-white/80 border-green-200 shadow-lg shadow-green-900/5';
      case 'error':
        return 'bg-white/80 border-red-200 shadow-lg shadow-red-900/5';
      case 'warning':
        return 'bg-white/80 border-amber-200 shadow-lg shadow-amber-900/5';
      case 'info':
      default:
        return 'bg-white/80 border-blue-200 shadow-lg shadow-blue-900/5';
    }
  };

  const getProgressColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden w-full max-w-sm rounded-xl border p-4 backdrop-blur-md transition-all duration-300 ease-out
        ${getStyles(notification.type)}
        ${isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
        animate-in slide-in-from-right-full fade-in
      `}
      role="alert"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-snug">
            {notification.message}
          </p>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-900 transition-colors p-0.5 rounded-full hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100">
          <div
            className={`h-full transition-all duration-75 ease-linear ${getProgressColor(notification.type)}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function NotificationContainer() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <div className="flex flex-col gap-3 items-end pointer-events-auto w-full">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}
