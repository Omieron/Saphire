import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

interface ToastProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    type?: ToastType;
    duration?: number; // Auto-close duration in ms (0 = no auto-close)
}

export default function Toast({
    isOpen,
    onClose,
    message,
    type = 'success',
    duration = 3000,
}: ToastProps) {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle size={20} className="text-white" />,
        error: <XCircle size={20} className="text-white" />,
        warning: <AlertCircle size={20} className="text-white" />,
    };

    const colors = {
        success: 'from-emerald-500 to-teal-500',
        error: 'from-red-500 to-rose-500',
        warning: 'from-amber-500 to-orange-500',
    };

    const shadows = {
        success: 'shadow-emerald-500/25',
        error: 'shadow-red-500/25',
        warning: 'shadow-amber-500/25',
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${colors[type]} text-white rounded-xl shadow-lg ${shadows[type]}`}>
                {icons[type]}
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress bar for auto-close */}
            {duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl overflow-hidden">
                    <div
                        className="h-full bg-white/60 animate-shrink"
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            )}

            <style>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-shrink {
                    animation: shrink linear forwards;
                }
            `}</style>
        </div>
    );
}
