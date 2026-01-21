import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export type StatusModalType = 'success' | 'error' | 'warning';

interface StatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: StatusModalType;
}

export default function StatusModal({
    isOpen,
    onClose,
    title,
    message,
    type = 'success',
}: StatusModalProps) {
    const { t } = useLanguage();

    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle size={48} className="text-emerald-500" />,
        error: <XCircle size={48} className="text-red-500" />,
        warning: <AlertCircle size={48} className="text-amber-500" />,
    };

    const gradientColors = {
        success: 'from-emerald-500/10 to-teal-500/10',
        error: 'from-red-500/10 to-rose-500/10',
        warning: 'from-amber-500/10 to-orange-500/10',
    };

    const buttonColors = {
        success: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25',
        error: 'bg-red-500 hover:bg-red-600 shadow-red-500/25',
        warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300">
                {/* Visual Header */}
                <div className={`h-32 bg-gradient-to-br ${gradientColors[type]} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-32 h-32 rounded-full bg-current blur-2xl" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 rounded-full bg-current blur-2xl" />
                    </div>
                    <div className="relative transform scale-110">
                        {icons[type]}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-[var(--color-text)] mb-2">
                        {title}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed mb-8">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-4 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${buttonColors[type]}`}
                    >
                        {t.common.close || 'Kapat'}
                    </button>
                </div>
            </div>
        </div>
    );
}
