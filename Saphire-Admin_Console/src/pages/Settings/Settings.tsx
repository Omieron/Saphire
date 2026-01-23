import { useState, useEffect, Fragment } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Globe, Moon, Sun, Check, Terminal, Shield, AlertCircle, Calendar, Hash, Settings as SettingsIcon, Zap, Layout, BellRing, ChevronDown } from 'lucide-react';
import api from '../../api/axios';

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
    const [expandedLogs, setExpandedLogs] = useState<number[]>([]);

    const toggleLog = (id: number) => {
        setExpandedLogs(prev =>
            prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
        );
    };

    // Logs state
    const [logs, setLogs] = useState<ErrorLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);

    useEffect(() => {
        if (activeTab === 'logs') {
            setIsLoadingLogs(true);
            const fetchLogs = async () => {
                try {
                    const response = await api.get('/system/logs');
                    const sortedLogs = Array.isArray(response.data.data)
                        ? [...response.data.data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        : [];
                    setLogs(sortedLogs);
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
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Premium Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-teal-500/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-20 -mt-20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 -ml-10 -mb-10 rounded-full blur-2xl" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold tracking-widest uppercase border border-white/10">
                            <Zap size={14} className="fill-current" />
                            System Configuration
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            {t.sidebar.settings}
                        </h1>
                        <p className="text-teal-50 max-w-md text-lg font-medium leading-relaxed opacity-90">
                            Uygulama genel ayarlarını ve sistem günlüklerini buradan yönetebilirsiniz.
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex bg-white/10 backdrop-blur-xl p-1.5 rounded-2xl border border-white/20 shadow-inner">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'general'
                                ? 'bg-white text-teal-600 shadow-xl scale-105'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <SettingsIcon className={`w-4 h-4 ${activeTab === 'general' ? 'animate-spin-slow' : ''}`} />
                            {t.settings.general}
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'logs'
                                ? 'bg-white text-teal-600 shadow-xl scale-105'
                                : 'text-white hover:bg-white/10'
                                }`}
                        >
                            <Terminal className="w-4 h-4" />
                            {t.sidebar.logs}
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'general' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
                    {/* Language Section */}
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-sm h-full">
                            <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-teal-500/5 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--color-text)]">{t.settings.language}</h2>
                                        <p className="text-xs text-[var(--color-text-secondary)]">Sistem dilini değiştirin</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                {[
                                    { id: 'en', label: t.settings.english, sub: 'English (US)', flag: '🇺🇸', icon: 'EN' },
                                    { id: 'tr', label: t.settings.turkish, sub: 'Türkçe', flag: '🇹🇷', icon: 'TR' }
                                ].map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => setLanguage(lang.id as any)}
                                        className={`w-full group/item flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${language === lang.id
                                            ? 'border-teal-500 bg-teal-500/5 shadow-lg shadow-teal-500/5 ring-1 ring-teal-500/20'
                                            : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-teal-500/40 hover:bg-[var(--color-surface-hover)]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300 ${language === lang.id
                                                ? 'bg-teal-500 text-white shadow-lg'
                                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] group-hover/item:scale-110'
                                                }`}>
                                                {lang.icon}
                                            </div>
                                            <div className="text-left">
                                                <span className={`block text-base font-bold transition-colors ${language === lang.id ? 'text-teal-600' : 'text-[var(--color-text)]'}`}>
                                                    {lang.label}
                                                </span>
                                                <span className="text-xs text-[var(--color-text-secondary)] font-medium">{lang.sub}</span>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${language === lang.id
                                            ? 'bg-teal-500 border-teal-500 scale-110'
                                            : 'border-[var(--color-border)]'
                                            }`}>
                                            {language === lang.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-sm h-full">
                            <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <Layout className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-[var(--color-text)]">{t.settings.appearance}</h2>
                                        <p className="text-xs text-[var(--color-text-secondary)]">Görünüm ve tema tercihleri</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 grid grid-cols-1 gap-4">
                                {[
                                    { id: 'light', label: t.settings.light, icon: Sun, desc: 'Aydınlık ve ferah görünüm' },
                                    { id: 'dark', label: t.settings.dark, icon: Moon, desc: 'Gözlerinizi yormayan koyu tema' }
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setTheme(item.id as any)}
                                            className={`group/item flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${theme === item.id
                                                ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                                                : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:border-emerald-500/40 hover:bg-[var(--color-surface-hover)]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${theme === item.id
                                                    ? 'bg-emerald-500 text-white shadow-lg'
                                                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] group-hover/item:rotate-12'
                                                    }`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div className="text-left">
                                                    <span className={`block text-base font-bold transition-colors ${theme === item.id ? 'text-emerald-600' : 'text-[var(--color-text)]'}`}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-xs text-[var(--color-text-secondary)] font-medium">{item.desc}</span>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${theme === item.id
                                                ? 'bg-emerald-500 border-emerald-500 scale-110'
                                                : 'border-[var(--color-border)]'
                                                }`}>
                                                {theme === item.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mx-8 p-4 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] border-dashed mb-8">
                                <div className="flex items-center gap-3">
                                    <BellRing className="w-4 h-4 text-emerald-500" />
                                    <p className="text-[10px] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
                                        Beta Feature: Theme Scheduling coming soon
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[2rem] overflow-hidden shadow-xl">
                        <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <Terminal className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--color-text)]">{t.systemLogs.title}</h2>
                                    <p className="text-xs text-[var(--color-text-secondary)]">Son 100 sistem olayını takip edin</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] rounded-full border border-[var(--color-border)]">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest text-[var(--color-text-secondary)] uppercase">Live Debugging</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)] sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 w-12"></th>
                                        <th className="px-4 py-4 font-black text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase">
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-3 h-3 text-red-500" />
                                                ID
                                            </div>
                                        </th>
                                        <th className="px-8 py-4 font-black text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-3 h-3 text-red-500" />
                                                {t.systemLogs.ipAddress}
                                            </div>
                                        </th>
                                        <th className="px-8 py-4 font-black text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase">
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-3 h-3 text-red-500" />
                                                {t.systemLogs.source}
                                            </div>
                                        </th>
                                        <th className="px-8 py-4 font-black text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-red-500" />
                                                {t.systemLogs.date}
                                            </div>
                                        </th>
                                        <th className="px-8 py-4 font-black text-[10px] tracking-widest text-[var(--color-text-secondary)] uppercase">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3 text-red-500" />
                                                {t.systemLogs.description}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
                                    {isLoadingLogs ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 border-4 border-red-500/10 border-t-red-500 rounded-full animate-spin" />
                                                        <Terminal className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                                                    </div>
                                                    <span className="text-sm font-bold text-[var(--color-text-secondary)] animate-pulse">{t.common.loading}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : !Array.isArray(logs) || logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-50">
                                                    <AlertCircle size={48} className="text-[var(--color-text-secondary)]" />
                                                    <span className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">{t.systemLogs.noLogs}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <Fragment key={log.id}>
                                                <tr
                                                    onClick={() => toggleLog(log.id)}
                                                    className={`hover:bg-red-500/[0.02] transition-all group border-transparent hover:border-red-500/10 border-l-4 cursor-pointer ${expandedLogs.includes(log.id) ? 'bg-red-500/[0.04] border-red-500 shadow-sm' : ''}`}
                                                >
                                                    <td className="px-6 py-4 text-center">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${expandedLogs.includes(log.id) ? 'bg-red-500 text-white rotate-180 shadow-lg shadow-red-500/20' : 'bg-red-500/5 text-red-500 group-hover:bg-red-500/10'}`}>
                                                            <ChevronDown size={14} className="stroke-[3]" />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-[var(--color-text-secondary)] font-mono text-sm leading-none flex items-center">
                                                        <span className="opacity-40 leading-none">#</span>{log.id}
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="px-3 py-1 bg-[var(--color-bg)] rounded-lg text-xs font-bold font-mono text-[var(--color-text)] border border-[var(--color-border)]">
                                                            {log.ipAddress}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 max-w-[200px] truncate" title={log.sourceClass}>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-[var(--color-text)]">{log.sourceClass.split('.').pop()}</span>
                                                            <span className="text-[10px] text-[var(--color-text-secondary)] font-medium leading-tight">{log.sourceClass}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4 text-[var(--color-text-secondary)] whitespace-nowrap text-sm font-medium">
                                                        {new Date(log.timestamp).toLocaleString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className={`text-sm font-semibold leading-relaxed transition-all duration-300 line-clamp-1 max-w-sm ${expandedLogs.includes(log.id) ? 'text-red-600' : 'text-[var(--color-text)] group-hover:text-red-500'}`} title={log.description}>
                                                            {log.description}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedLogs.includes(log.id) && (
                                                    <tr className="bg-red-500/[0.02] border-l-4 border-red-500 animate-in slide-in-from-top-2 duration-300">
                                                        <td colSpan={6} className="px-8 py-6">
                                                            <div className="bg-[var(--color-bg)] p-6 rounded-2xl border border-red-500/20 shadow-xl relative overflow-hidden group/detail">
                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 -mr-16 -mt-16 rounded-full blur-2xl group-hover/detail:bg-red-500/10 transition-colors" />
                                                                <div className="relative space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                                                            <AlertCircle size={12} className="animate-pulse" /> Full System Log Fragment
                                                                        </h4>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="px-2 py-0.5 bg-red-500/10 rounded text-[9px] font-bold text-red-500 border border-red-500/20">EVENT ID: {log.id}</span>
                                                                            <span className="px-2 py-0.5 bg-red-500/10 rounded text-[9px] font-bold text-red-500 border border-red-500/20">IP: {log.ipAddress}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-5 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] font-mono text-sm text-[var(--color-text)] leading-loose whitespace-pre-wrap break-all border-l-4 border-red-500 shadow-inner overflow-hidden">
                                                                        {log.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
