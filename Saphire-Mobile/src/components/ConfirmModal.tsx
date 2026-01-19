interface ConfirmModalProps {
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'red' | 'teal' | 'green';
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

    const colorClasses = {
        red: 'bg-red-500 hover:bg-red-600',
        teal: 'bg-teal-500 hover:bg-teal-600',
        green: 'bg-green-500 hover:bg-green-600'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-scale-in">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 text-white rounded-lg font-medium transition-colors ${colorClasses[confirmColor]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
