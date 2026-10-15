import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-md w-full pointer-events-none select-none px-4"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        let Icon = Info;
        let iconColor = 'text-[#0071E3] dark:text-[#0A84FF]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          iconColor = 'text-[#34C759]';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-[#FF3B30]';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-[#FF9500]';
        }

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1C1C1E]/90 dark:bg-white/95 text-white dark:text-[#1D1D1F] border border-white/10 dark:border-black/10 shadow-2xl backdrop-blur-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-3 max-w-sm"
          >
            <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-semibold leading-tight truncate">{toast.title}</h4>
              {toast.description && (
                <p className="text-[11px] opacity-75 leading-tight truncate">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
