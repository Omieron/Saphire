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
            headerBg: 'from-[var(--color-error-soft)] to-[var(--color-error-soft)]',
            iconBg: 'bg-[var(--color-error)]',
            icon: <AlertTriangle size={22} className="text-white" />,
            btnBg: 'bg-[var(--color-error)] hover:opacity-90 shadow-[var(--color-error-soft)]',
            focusRing: 'focus:ring-[var(--color-error)]'
        },
        teal: {
            headerBg: 'from-[var(--color-primary-soft)] to-[var(--color-primary-soft)]',
            iconBg: 'bg-[var(--color-primary)]',
            icon: <Info size={22} className="text-white" />,
            btnBg: 'bg-[var(--color-primary)] hover:opacity-90 shadow-[var(--color-primary-soft)]',
            focusRing: 'focus:ring-[var(--color-primary)]'
        },
        green: {
            headerBg: 'from-[var(--color-success-soft)] to-[var(--color-success-soft)]',
            iconBg: 'bg-[var(--color-success)]',
            icon: <CheckCircle2 size={22} className="text-white" />,
            btnBg: 'bg-[var(--color-success)] hover:opacity-90 shadow-[var(--color-success-soft)]',
            focusRing: 'focus:ring-[var(--color-success)]'
        },
        blue: {
            headerBg: 'from-[var(--color-info-soft)] to-[var(--color-info-soft)]',
            iconBg: 'bg-[var(--color-info)]',
            icon: <Info size={22} className="text-white" />,
            btnBg: 'bg-[var(--color-info)] hover:opacity-90 shadow-[var(--color-info-soft)]',
            focusRing: 'focus:ring-[var(--color-info)]'
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
                        <div className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-lg`}>
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
                        className="flex-1 px-4 py-4 border-2 border-[var(--color-border)] text-[var(--color-text)] rounded-2xl bg-[var(--color-surface)] font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 shadow-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-4 ${style.btnBg} text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95 border-b-4 border-black/20`}
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
