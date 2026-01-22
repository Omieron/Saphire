import { useOnboarding } from '../../contexts/OnboardingContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { HelpCircle, Menu } from 'lucide-react';
import AlertCenter from '../AlertCenter/AlertCenter';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const { startTour } = useOnboarding();
    const { toggleCollapsed } = useSidebar();

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
            <div className="flex items-center gap-1 md:gap-2">
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
            </div>
        </header>
    );
}
