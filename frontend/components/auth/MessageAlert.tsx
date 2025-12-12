'use client';

import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface MessageAlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

export function MessageAlert({
  type,
  title,
  message,
  onClose,
  autoClose = false,
  autoCloseDuration = 3000,
}: MessageAlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDuration, onClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      title: 'Success',
      titleColor: 'text-green-900',
      textColor: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      title: 'Error',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      title: 'Warning',
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      title: 'Info',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`rounded-lg border ${config.bg} ${config.border} p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <div className="flex-shrink-0 pt-0.5">{config.icon}</div>

      <div className="flex-1">
        {title && <p className={`font-semibold ${config.titleColor}`}>{title}</p>}
        <p className={`text-sm ${config.textColor}`}>{message}</p>
      </div>

      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className={`flex-shrink-0 text-gray-400 hover:text-gray-600 transition`}
          aria-label="Close alert"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
