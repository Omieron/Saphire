import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    rightActions?: ReactNode;
    isDashboard?: boolean;
}

export default function Header({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightActions,
    isDashboard = false
}: HeaderProps) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-6 py-5 shadow-lg sticky top-0 z-30">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors active:scale-90"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    <div>
                        {isDashboard ? (
                            <>
                                <h1 className="text-2xl font-bold tracking-tight">Saphire</h1>
                                <p className="text-white/80 text-sm font-medium">{user?.fullName}</p>
                            </>
                        ) : (
                            <div className="flex flex-col">
                                <h1 className="text-xl font-bold">{title}</h1>
                                {subtitle && <p className="text-white/80 text-xs">{subtitle}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {rightActions && (
                    <div className="flex items-center gap-2">
                        {rightActions}
                    </div>
                )}
            </div>
        </header>
    );
}
