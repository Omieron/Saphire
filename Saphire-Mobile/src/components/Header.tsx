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
    centerContent?: ReactNode;
    isDashboard?: boolean;
}

export default function Header({
    title,
    subtitle,
    showBack = false,
    onBack,
    rightActions,
    centerContent,
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
                <div className="flex-1 flex items-center gap-4">
                    {showBack && (
                        <button
                            onClick={handleBack}
                            className="p-3 bg-white/20 text-white rounded-xl shadow-lg border border-white/20 active:scale-90 transition-all"
                        >
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    <div className="max-w-[150px] sm:max-w-none">
                        {isDashboard ? (
                            <>
                                <h1 className="text-2xl font-bold tracking-tight text-white truncate">Saphire</h1>
                                <p className="text-white/80 text-sm font-medium truncate">{user?.fullName}</p>
                            </>
                        ) : (
                            <div className="flex flex-col">
                                <h1 className="text-xl font-bold text-white truncate">{title}</h1>
                                {subtitle && <p className="text-white/80 text-xs truncate">{subtitle}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {centerContent && (
                    <div className="flex-1 flex justify-center">
                        {centerContent}
                    </div>
                )}

                <div className="flex-1 flex items-center justify-end gap-2">
                    {rightActions}
                </div>
            </div>
        </header>
    );
}
