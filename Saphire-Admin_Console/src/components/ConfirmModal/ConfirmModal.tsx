import { useState, useEffect, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmWord?: string; // Word user must type to confirm
    loading?: boolean;
    simple?: boolean; // If true, hide the input and typing requirement
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'primary';
    children?: ReactNode;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmWord,
    loading = false,
    simple = false,
    confirmLabel,
    cancelLabel,
    variant = 'danger',
    children,
}: ConfirmModalProps) {
    const { t, language } = useLanguage();
    const [inputValue, setInputValue] = useState('');

    // Default confirm word based on language
    const requiredWord = confirmWord || (language === 'tr' ? 'SİL' : 'DELETE');
    // Use locale-aware comparison for Turkish İ character
    const normalizeForCompare = (str: string) => {
        return str.toLocaleUpperCase('tr-TR');
    };
    const isConfirmEnabled = simple || normalizeForCompare(inputValue) === normalizeForCompare(requiredWord);

    useEffect(() => {
        if (!isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl w-full max-w-md modal-content overflow-hidden">
                {/* Header with danger/delete color - pure red */}
                <div className="bg-gradient-to-r from-red-500/10 to-red-400/10 px-6 py-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${variant === 'danger' ? 'from-red-500 to-red-600' : 'from-teal-500 to-teal-600'} flex items-center justify-center`}>
                            <AlertTriangle size={20} className="text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-[var(--color-text-secondary)] mb-4">
                        {message}
                    </p>

                    {children && (
                        <div className="mb-4">
                            {children}
                        </div>
                    )}

                    {!simple && (
                        <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                            <p className="text-sm text-[var(--color-text)] mb-2">
                                {language === 'tr'
                                    ? `Onaylamak için "${requiredWord}" yazın:`
                                    : `Type "${requiredWord}" to confirm:`
                                }
                            </p>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={requiredWord}
                                className={`w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 ${variant === 'danger' ? 'focus:ring-red-500' : 'focus:ring-teal-500'} text-center font-mono text-lg uppercase`}
                                autoFocus
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-3 border border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:bg-[var(--color-surface-hover)] font-medium transition-all disabled:opacity-50"
                    >
                        {cancelLabel || t.common.cancel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isConfirmEnabled || loading}
                        className={`flex-1 px-4 py-3 bg-gradient-to-r ${variant === 'danger'
                            ? 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-500/25'
                            : 'from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-teal-500/25'
                            } text-white rounded-xl font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? t.common.loading : (confirmLabel || (variant === 'danger' ? t.common.delete : t.common.save))}
                    </button>
                </div>
            </div>
        </div>
    );
}
