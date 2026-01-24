import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Moon, Sun, Globe, LogOut } from 'lucide-react';

export default function Settings() {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col animate-fade-in">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-5 flex items-center gap-4 shadow-lg sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold">{t.settings.title}</h1>
            </header>

            <main className="flex-1 p-6 space-y-6">
                {/* User Info Card */}
                <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 text-2xl font-bold border-2 border-teal-500/20">
                        {user?.fullName?.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text)]">{user?.fullName}</h2>
                        <p className="text-[var(--color-text-secondary)] text-sm">{user?.username}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Theme Setting */}
                    <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-600">
                                {isDark ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <h3 className="font-bold text-[var(--color-text)]">{t.settings.appearance}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setTheme('light')}
                                className={`py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${!isDark ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                            >
                                <Sun size={20} />
                                {t.theme.light}
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                            >
                                <Moon size={20} />
                                {t.theme.dark}
                            </button>
                        </div>
                    </div>

                    {/* Language Setting */}
                    <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Globe size={20} />
                            </div>
                            <h3 className="font-bold text-[var(--color-text)]">{t.settings.language}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setLanguage('tr')}
                                className={`py-4 rounded-xl font-bold transition-all ${language === 'tr' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                            >
                                Türkçe
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`py-4 rounded-xl font-bold transition-all ${language === 'en' ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-red-500/10 text-red-600 rounded-2xl font-bold transition-all active:scale-95 border border-red-500/20"
                    >
                        <LogOut size={22} />
                        {t.settings.logout}
                    </button>
                </div>
            </main>

            {/* Version Info */}
            <footer className="p-8 text-center">
                <p className="text-[var(--color-text-secondary)] text-xs opacity-50 font-mono">
                    Saphire Mobile v2.0.0
                </p>
            </footer>
        </div>
    );
}
