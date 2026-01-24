import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Moon, Sun, Globe, LogOut } from 'lucide-react';
import Header from '../../components/Header';
import Avatar from '../../components/Avatar';
import ConfirmModal from '../../components/ConfirmModal';

export default function Settings() {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, setTheme } = useTheme();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col animate-fade-in">
            <Header
                title={t.settings.title}
                showBack
                onBack={() => navigate('/dashboard')}
                rightActions={
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="p-3 bg-red-500 text-white rounded-xl shadow-lg border border-red-400 active:scale-90 transition-all"
                        title={t.settings.logout}
                    >
                        <LogOut size={22} />
                    </button>
                }
            />

            <ConfirmModal
                show={showLogoutConfirm}
                title={t.settings.logout}
                message={t.qcEntry.exitConfirm}
                onConfirm={logout}
                onCancel={() => setShowLogoutConfirm(false)}
                confirmText={t.settings.logout}
                confirmColor="red"
            />

            <main className="flex-1 p-6 relative z-20">
                <div className="app-container">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Integrated User Section */}
                        <div className="md:col-span-2 flex items-center justify-between pb-8 border-b border-[var(--color-border)] mb-4">
                            <div className="flex items-center gap-5">
                                <Avatar
                                    name={user?.fullName}
                                    size="lg"
                                    className="ring-4 ring-teal-500/10 shadow-xl"
                                />
                                <div>
                                    <h2 className="text-2xl font-black text-[var(--color-text)] uppercase tracking-tight">{user?.fullName}</h2>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="px-2 py-0.5 bg-teal-500/10 text-teal-600 rounded text-[10px] font-black uppercase tracking-widest">
                                            {user?.username}
                                        </div>
                                        <div className="w-1 h-1 bg-[var(--color-border)] rounded-full" />
                                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Operator Panel</span>
                                    </div>
                                </div>
                            </div>
                        </div>

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
            </main>

            {/* Version Info */}
            <footer className="p-8 text-center">
                <p className="text-[var(--color-text-secondary)] text-xs opacity-50 font-mono">
                    Saphire Mobile v1.0.0
                </p>
            </footer>
        </div>
    );
}
