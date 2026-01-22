import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Globe, Moon, Sun, Check } from 'lucide-react';

export default function Settings() {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();

    return (
        <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Language Section Mini */}
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-teal-500" />
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">{t.settings.language}</h2>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                        { id: 'en', label: t.settings.english, sub: 'English (US)', flag: '🇺🇸' },
                        { id: 'tr', label: t.settings.turkish, sub: 'Türkçe', flag: '🇹🇷' }
                    ].map((lang) => (
                        <button
                            key={lang.id}
                            onClick={() => setLanguage(lang.id as any)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${language === lang.id
                                    ? 'border-teal-500 bg-teal-500/5'
                                    : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-teal-500/30'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{lang.flag}</span>
                                <div className="text-left">
                                    <span className={`block text-sm font-medium ${language === lang.id ? 'text-teal-500' : 'text-[var(--color-text)]'}`}>
                                        {lang.label}
                                    </span>
                                    <span className="text-[10px] text-[var(--color-text-secondary)]">{lang.sub}</span>
                                </div>
                            </div>
                            {language === lang.id && <Check className="w-4 h-4 text-teal-500" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appearance Section Mini */}
            <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-teal-500" />
                    <h2 className="text-sm font-semibold text-[var(--color-text)]">{t.settings.appearance}</h2>
                </div>

                <div className="p-4 grid grid-cols-2 gap-3">
                    {[
                        { id: 'light', label: t.settings.light, icon: Sun },
                        { id: 'dark', label: t.settings.dark, icon: Moon }
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setTheme(item.id as any)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${theme === item.id
                                        ? 'border-teal-500 bg-teal-500/5'
                                        : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-teal-500/30'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-md ${theme === item.id ? 'bg-teal-500 text-white' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span className={`text-sm font-medium ${theme === item.id ? 'text-teal-500' : 'text-[var(--color-text)]'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
