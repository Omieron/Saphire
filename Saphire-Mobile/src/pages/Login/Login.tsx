import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Eye, EyeOff, LogIn, Globe, Smartphone } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch {
            setError(t.login.failed);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 flex items-center justify-center p-6">
            {/* Language Toggle */}
            <button
                onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-white font-medium"
            >
                <Globe size={18} />
                {language === 'en' ? 'TR' : 'EN'}
            </button>

            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-2xl mb-4">
                        <Smartphone size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white">Saphire</h1>
                    <p className="text-white/80 mt-2 text-lg">{t.login.title}</p>
                </div>

                {/* Login Card */}
                <div className="bg-[var(--color-surface)] rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                                {t.login.username}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-5 py-4 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-2xl text-[var(--color-text)] text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                placeholder={t.login.username}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
                                {t.login.password}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-2xl text-[var(--color-text)] text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all pr-14"
                                    placeholder={t.login.password}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[var(--color-text-secondary)]"
                                >
                                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xl font-bold rounded-2xl hover:from-teal-600 hover:to-emerald-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-teal-500/25"
                        >
                            {loading ? (
                                <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={24} />
                                    {t.login.signIn}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-white/60 text-sm mt-6">
                    © 2026 Crownbyte
                </p>
            </div>
        </div>
    );
}
