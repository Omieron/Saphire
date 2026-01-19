import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Eye, EyeOff, Sun, Moon, LogIn, Shield, BarChart3, ClipboardCheck, Globe } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { t, language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || t.auth.loginFailed);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: ClipboardCheck, title: language === 'tr' ? 'Kalite Kontrol' : 'Quality Control', desc: language === 'tr' ? 'Kapsamlı QC şablonları' : 'Comprehensive QC templates' },
        { icon: BarChart3, title: language === 'tr' ? 'Analitik' : 'Analytics', desc: language === 'tr' ? 'Gerçek zamanlı raporlar' : 'Real-time reports' },
        { icon: Shield, title: language === 'tr' ? 'Güvenlik' : 'Security', desc: language === 'tr' ? 'Endüstri standardı güvenlik' : 'Industry-standard security' },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-300/20 rounded-full blur-2xl" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
                    <h1 className="text-5xl xl:text-6xl font-bold mb-4">Saphire</h1>
                    <p className="text-xl xl:text-2xl text-white/80 mb-12">
                        {language === 'tr' ? 'Üretim Kalite Kontrol Sistemi' : 'Production Quality Control System'}
                    </p>

                    {/* Features */}
                    <div className="space-y-6">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                                    <feature.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                                    <p className="text-white/70 text-sm">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Slogan */}
                    <div className="mt-12 pt-8 border-t border-white/20">
                        <p className="text-xl italic text-white/80">
                            "{language === 'tr'
                                ? 'Kalite, tesadüf değil kararlılığın sonucudur.'
                                : 'Quality is never an accident, it is the result of intention.'}"
                        </p>
                        <p className="text-white/50 text-sm mt-3">
                            — {language === 'tr' ? 'Mükemmellik için tasarlandı' : 'Designed for excellence'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Top controls */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {/* Language Toggle */}
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all text-sm font-medium text-[var(--color-text)]"
                    >
                        <Globe size={16} />
                        {language === 'en' ? 'TR' : 'EN'}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-all"
                    >
                        {theme === 'dark' ? (
                            <Sun size={18} className="text-yellow-400" />
                        ) : (
                            <Moon size={18} className="text-slate-600" />
                        )}
                    </button>
                </div>

                <div className="w-full max-w-md">
                    {/* Mobile Logo - only visible on smaller screens */}
                    <div className="text-center mb-8 lg:hidden">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                            Saphire
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
                            {language === 'tr' ? 'Üretim Kalite Kontrol Sistemi' : 'Production Quality Control System'}
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-[var(--color-text)]">
                                {t.auth.welcome}
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                {language === 'tr' ? 'Devam etmek için giriş yapın' : 'Sign in to continue'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                    {t.auth.username}
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder={t.auth.enterUsername}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                                    {t.auth.password}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-12"
                                        placeholder={t.auth.enterPassword}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        {t.auth.login}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[var(--color-text-secondary)] text-xs mt-6">
                        © 2026 Crownbyte. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
