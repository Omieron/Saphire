import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Globe, Moon, Sun, Check, Terminal, Shield, AlertCircle, Calendar, Hash, Settings as SettingsIcon } from 'lucide-react';

interface ErrorLog {
    id: number;
    ipAddress: string;
    sourceClass: string;
    description: string;
    timestamp: string;
}

export default function Settings() {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'general' | 'logs'>('general');

    // Logs state
    const [logs, setLogs] = useState<ErrorLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    useEffect(() => {
        if (activeTab === 'logs') {
            setIsLoadingLogs(true);
            const fetchLogs = async () => {
                try {
                    const response = await fetch('/api/v1/system/logs', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    if (response.ok) {
                        const result = await response.json();
                        setLogs(Array.isArray(result.data) ? result.data : []);
                    }
                } catch (error) {
                    console.error('Failed to fetch logs:', error);
                } finally {
                    setIsLoadingLogs(false);
                }
            };
            fetchLogs();
        }
    }, [activeTab]);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Tabs Header */}
            <div className="flex items-center gap-1 p-1 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'general'
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                        }`}
                >
                    <SettingsIcon className="w-4 h-4" />
                    {t.settings.general}
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'logs'
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                        }`}
                >
                    <Terminal className="w-4 h-4" />
                    {t.sidebar.logs}
                </button>
            </div>

            {activeTab === 'general' ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
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
            ) : (
                <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-300">
                    <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent">
                        <div className="flex items-center gap-2.5">
                            <Terminal className="w-4 h-4 text-red-500" />
                            <h2 className="text-sm font-semibold text-[var(--color-text)]">{t.systemLogs.title}</h2>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)] text-[var(--color-text-secondary)] uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold text-[10px] tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <Hash className="w-3 h-3" />
                                            ID
                                        </div>
                                    </th>
                                    <th className="px-5 py-3 font-semibold text-[10px] tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="w-3 h-3" />
                                            {t.systemLogs.ipAddress}
                                        </div>
                                    </th>
                                    <th className="px-5 py-3 font-semibold text-[10px] tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <Shield className="w-3 h-3" />
                                            {t.systemLogs.source}
                                        </div>
                                    </th>
                                    <th className="px-5 py-3 font-semibold text-[10px] tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" />
                                            {t.systemLogs.date}
                                        </div>
                                    </th>
                                    <th className="px-5 py-3 font-semibold text-[10px] tracking-wider">
                                        <div className="flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" />
                                            {t.systemLogs.description}
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {isLoadingLogs ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-10 text-center text-[var(--color-text-secondary)]">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                                                <span>{t.common.loading}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : !Array.isArray(logs) || logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-10 text-center text-[var(--color-text-secondary)]">
                                            {t.systemLogs.noLogs}
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-5 py-3 text-[var(--color-text-secondary)] font-mono">
                                                #{log.id}
                                            </td>
                                            <td className="px-5 py-3 text-[var(--color-text)] font-medium">
                                                {log.ipAddress}
                                            </td>
                                            <td className="px-5 py-3 max-w-[200px] truncate" title={log.sourceClass}>
                                                <span className="text-[var(--color-text-secondary)]">{log.sourceClass}</span>
                                            </td>
                                            <td className="px-5 py-3 text-[var(--color-text-secondary)] whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString(undefined, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="text-[var(--color-text)] break-words line-clamp-2" title={log.description}>
                                                    {log.description}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
