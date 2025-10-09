'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-[10000] animate-slide-in-right">
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl min-w-[300px] max-w-[500px] ${
          type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle size={24} className="flex-shrink-0" />
        ) : (
          <XCircle size={24} className="flex-shrink-0" />
        )}
        <p className="flex-1 font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
