import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Moon, Sun, Globe } from 'lucide-react';
import Header from '../../components/Header';

export default function Settings() {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, setTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();


    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col animate-fade-in">
            <Header
                title={t.settings.title}
                showBack
                onBack={() => navigate('/dashboard')}
            />

            <main className="flex-1 p-6">
                <div className="app-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Info Card */}
                        <div className="bg-gradient-to-br from-teal-700 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-teal-900/20 md:col-span-2 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 text-2xl font-bold border-2 border-teal-500/20">
                                {user?.fullName?.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
                                <p className="text-teal-100 text-sm">{user?.username}</p>
                            </div>
                        </div>

                        {/* Application Settings Group */}
                        <div className="space-y-6">
                            {/* Appearance Section */}
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 admin-card space-y-4">
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

                            {/* Language Section */}
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 admin-card space-y-4">
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
                        </div>
                    </div>
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
