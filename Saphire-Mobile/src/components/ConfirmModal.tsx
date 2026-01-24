import { AlertTriangle, X, Info, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'red' | 'teal' | 'green' | 'blue';
}

export default function ConfirmModal({
    show,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    confirmColor = 'teal'
}: ConfirmModalProps) {
    if (!show) return null;

    const variantStyles = {
        red: {
            headerBg: 'from-red-500/10 to-red-600/10',
            iconBg: 'from-red-500 to-red-600',
            icon: <AlertTriangle size={22} className="text-white" />,
            btnBg: 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/25',
            focusRing: 'focus:ring-red-500'
        },
        teal: {
            headerBg: 'from-teal-500/10 to-teal-600/10',
            iconBg: 'from-teal-500 to-teal-600',
            icon: <Info size={22} className="text-white" />,
            btnBg: 'from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-teal-500/25',
            focusRing: 'focus:ring-teal-500'
        },
        green: {
            headerBg: 'from-emerald-500/10 to-emerald-600/10',
            iconBg: 'from-emerald-500 to-emerald-600',
            icon: <CheckCircle2 size={22} className="text-white" />,
            btnBg: 'from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-500/25',
            focusRing: 'focus:ring-emerald-500'
        },
        blue: {
            headerBg: 'from-blue-500/10 to-blue-600/10',
            iconBg: 'from-blue-500 to-blue-600',
            icon: <Info size={22} className="text-white" />,
            btnBg: 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/25',
            focusRing: 'focus:ring-blue-500'
        }
    };

    const style = variantStyles[confirmColor];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onCancel}
            />

            {/* Modal Container */}
            <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-in">

                {/* Decorative Header Gradient */}
                <div className={`bg-gradient-to-r ${style.headerBg} px-6 py-5 border-b border-[var(--color-border)]`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-lg`}>
                            {style.icon}
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-text)] tracking-tight">
                            {title}
                        </h3>
                    </div>

                    {/* Close Button top-right */}
                    <button
                        onClick={onCancel}
                        className="absolute top-5 right-5 p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-xl transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6">
                    <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-5 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-4 border border-[var(--color-border)] text-[var(--color-text)] rounded-2xl hover:bg-[var(--color-surface)] font-bold transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-4 bg-gradient-to-r ${style.btnBg} text-white rounded-2xl font-bold shadow-xl transition-all active:scale-95`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}
