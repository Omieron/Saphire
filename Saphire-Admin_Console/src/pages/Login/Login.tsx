import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Eye, EyeOff, Sun, Moon, LogIn, Shield, BarChart3, ClipboardCheck, Globe, AlertCircle } from 'lucide-react';

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
        <div className="min-h-screen bg-[var(--color-bg)] flex animate-in fade-in duration-1000">
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 relative overflow-hidden group">
                {/* Dynamic Decorative Elements */}
                <div className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-pulse group-hover:bg-white/15 transition-colors duration-1000" />
                <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-emerald-400/20 rounded-full blur-[120px] group-hover:bg-emerald-400/30 transition-colors duration-1000" />
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-teal-300/10 rounded-full blur-[80px] animate-bounce-slow" />

                {/* Grid pattern with gradient fade */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 text-white">
                    <div className="animate-in slide-in-from-left-8 duration-700 delay-200">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black tracking-[0.2em] uppercase border border-white/10 mb-8 border-l-4 border-l-emerald-300">
                            Enterprise Edition
                        </div>
                        <h1 className="text-6xl xl:text-7xl font-black mb-6 tracking-tighter drop-shadow-2xl">
                            Saphire
                        </h1>
                        <p className="text-xl xl:text-2xl text-white/90 mb-16 font-medium leading-relaxed max-w-lg">
                            {language === 'tr'
                                ? 'Yüksek performanslı üretim ve kalite kontrol ekosistemi.'
                                : 'High-performance production and quality control ecosystem.'}
                        </p>
                    </div>

                    {/* Features with staggered animation */}
                    <div className="space-y-8 animate-in slide-in-from-left-12 duration-700 delay-400">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-6 group/item cursor-default">
                                <div className="w-14 h-14 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-white/25 group-hover/item:rotate-3 shadow-xl shadow-black/5">
                                    <feature.icon size={26} className="text-emerald-50" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl mb-1 tracking-tight">{feature.title}</h3>
                                    <p className="text-white/60 text-sm font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Slogan */}
                    <div className="mt-20 pt-10 border-t border-white/10 animate-in fade-in duration-1000 delay-700">
                        <div className="flex gap-4">
                            <div className="w-1.5 h-auto bg-emerald-400 rounded-full" />
                            <div>
                                <p className="text-xl font-medium leading-relaxed text-white/90">
                                    "{language === 'tr'
                                        ? 'Kalite, tesadüf değil kararlılığın sonucudur.'
                                        : 'Quality is never an accident, it is the result of intention.'}"
                                </p>
                                <p className="text-white/40 text-xs mt-4 font-bold tracking-widest uppercase">
                                    — {language === 'tr' ? 'Mükemmellik için tasarlandı' : 'Designed for excellence'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-bg-secondary)]">
                {/* Top controls */}
                <div className="absolute top-8 right-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-500">
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-teal-500/30 transition-all text-xs font-black tracking-widest text-[var(--color-text-secondary)] shadow-sm"
                    >
                        <Globe size={14} className="text-teal-500" />
                        {language === 'en' ? 'TR' : 'EN'}
                    </button>

                    <button
                        onClick={toggleTheme}
                        className="p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-emerald-500/30 transition-all shadow-sm group"
                    >
                        {theme === 'dark' ? (
                            <Sun size={18} className="text-yellow-400 transition-transform group-hover:rotate-45" />
                        ) : (
                            <Moon size={18} className="text-slate-600 transition-transform group-hover:-rotate-12" />
                        )}
                    </button>
                </div>

                <div className="w-full max-w-md animate-in zoom-in-95 fade-in duration-700 delay-100">
                    {/* Mobile Logo */}
                    <div className="text-center mb-12 lg:hidden">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl shadow-xl shadow-teal-500/20 mb-6">
                            <Shield size={32} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                            Saphire
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-3 text-sm font-bold uppercase tracking-widest">
                            {language === 'tr' ? 'Üretim Kalite Kontrol Sistemi' : 'Production Quality Control System'}
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-[var(--color-surface)]/80 backdrop-blur-2xl border border-[var(--color-border)] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 transition-all" />

                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
                                {t.auth.welcome}
                            </h2>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-3 font-medium">
                                {language === 'tr' ? 'Hesabınızla güvenli geçiş yapın' : 'Sign in securely to your account'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center animate-in shake-in-1 duration-300">
                                    <div className="flex items-center justify-center gap-2">
                                        <AlertCircle size={14} />
                                        {error}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-[0.15em] ml-1">
                                    {t.auth.username}
                                </label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-6 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium shadow-inner"
                                        placeholder={t.auth.enterUsername}
                                        required
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] opacity-30">
                                        <Globe size={18} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-xs font-black text-[var(--color-text-secondary)] uppercase tracking-[0.15em] ml-1">
                                    {t.auth.password}
                                </label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-6 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all font-medium shadow-inner pr-14"
                                        placeholder={t.auth.enterPassword}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-all"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black rounded-2xl hover:from-teal-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <LogIn size={20} className="stroke-[3]" />
                                            <span className="tracking-widest uppercase text-xs">{t.auth.login}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-12 text-center space-y-4">
                        <div className="flex items-center justify-center gap-6 saturate-0 opacity-40 hover:saturate-100 hover:opacity-100 transition-all duration-500 cursor-default">
                            <Shield size={20} className="text-[var(--color-text)]" />
                            <Globe size={20} className="text-[var(--color-text)]" />
                            <BarChart3 size={20} className="text-[var(--color-text)]" />
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-[10px] font-black tracking-[0.2em] uppercase">
                            © 2026 Crownbyte. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
