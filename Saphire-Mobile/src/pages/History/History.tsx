import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { recordApi } from '../../api';
import { Clock } from 'lucide-react';
import Header from '../../components/Header';

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
    const { t, language } = useLanguage();
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
            <Header
                title={t.history.title}
                showBack
                onBack={() => navigate('/dashboard')}
            />

            <main className="p-6">
                <div className="app-container">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-12 text-[var(--color-text-secondary)] admin-card p-10">
                            <Clock size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">{t.history.empty}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {records.map((record) => {
                                const { date, time } = formatDate(record.submittedAt);
                                return (
                                    <div
                                        key={record.id}
                                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center justify-between admin-card admin-card-hover"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[var(--color-text)]">
                                                    {record.machineName}{record.productName ? ` - ${record.productName}` : ''}
                                                </p>
                                                <p className="text-sm text-[var(--color-text-secondary)] font-medium">
                                                    {record.templateName}
                                                </p>
                                                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                                    {time} • {date}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
