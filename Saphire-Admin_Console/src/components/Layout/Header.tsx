import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Sun, Moon, Search, Globe, HelpCircle, Menu } from 'lucide-react';
import AlertCenter from '../AlertCenter/AlertCenter';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
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
                {/* Search - Hidden on mobile */}
                <div className="relative hidden md:block">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                    />
                    <input
                        type="text"
                        placeholder={t.common.search + '...'}
                        className="pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 lg:w-56"
                    />
                </div>

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

                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    data-tour="language"
                    className="flex items-center gap-1 px-2 md:px-3 py-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                    title={language === 'en' ? 'Switch to Turkish' : 'Türkçeye geç'}
                >
                    <Globe size={16} className="text-[var(--color-text-secondary)]" />
                    <span className="text-xs md:text-sm font-medium text-[var(--color-text)]">
                        {language.toUpperCase()}
                    </span>
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    data-tour="theme"
                    className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                    {theme === 'dark' ? (
                        <Sun size={18} className="text-yellow-400" />
                    ) : (
                        <Moon size={18} className="text-slate-600" />
                    )}
                </button>
            </div>
        </header>
    );
}
