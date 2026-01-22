import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { HelpCircle, Menu, LogOut, User as UserIcon } from 'lucide-react';
import AlertCenter from '../AlertCenter/AlertCenter';
import ConfirmModal from '../ConfirmModal/ConfirmModal';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const { logout, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { startTour } = useOnboarding();
    const { toggleCollapsed } = useSidebar();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="h-14 md:h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
            {/* Left side - Title */}
            <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                    onClick={toggleCollapsed}
                    className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                    <Menu size={20} className="text-[var(--color-text-secondary)]" />
                </button>
                <h1 className="text-lg md:text-xl font-semibold text-[var(--color-text)] truncate" data-tour="dashboard">
                    {title}
                </h1>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-1 md:gap-4">
                {/* Help/Tour */}
                <button
                    onClick={startTour}
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors hidden sm:block"
                    title="Start Tour"
                >
                    <HelpCircle size={18} className="text-[var(--color-text-secondary)]" />
                </button>

                {/* Notifications */}
                <AlertCenter />

                {/* User Info & Logout */}
                <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-[var(--color-border)]">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-[var(--color-text)] leading-none">{user?.fullName}</span>
                        <span className="text-[10px] text-[var(--color-text-secondary)] mt-1">{user?.role}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                            <UserIcon size={16} />
                        </div>

                        <button
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            title={t.auth.logout}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title={t.auth.logoutConfirm}
                message={t.auth.logoutMessage}
                confirmLabel={t.auth.logout}
                variant="danger"
                simple={true}
            />
        </header>
    );
}
