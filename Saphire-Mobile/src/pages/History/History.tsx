import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { recordApi } from '../../api';
import { ArrowLeft, Clock, Moon, Sun, Globe } from 'lucide-react';

interface HistoryRecord {
    id: number;
    machineId: number;
    machineName: string;
    productId?: number;
    productName?: string;
    templateName: string;
    submittedAt: string;
}

export default function History() {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, setTheme } = useTheme();
    const navigate = useNavigate();
    const [records, setRecords] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const response = await recordApi.getMyRecords();
            setRecords(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch records:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold">{t.history.title}</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setTheme(isDark ? 'light' : 'dark')}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            title={isDark ? t.theme.light : t.theme.dark}
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            title={language === 'en' ? 'Türkçe' : 'English'}
                        >
                            <Globe size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                ) : records.length === 0 ? (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                        <p>{t.history.empty}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {records.map((record) => {
                            const { date, time } = formatDate(record.submittedAt);
                            return (
                                <div
                                    key={record.id}
                                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500">
                                            <Clock size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--color-text)]">
                                                {record.machineName}{record.productName ? ` - ${record.productName}` : ''}
                                            </p>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {time} • {date}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
