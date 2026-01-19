import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { machineApi, templateApi } from '../../api';
import { Cog, Play, LogOut, Globe, History, X, ClipboardCheck, ArrowRight, Moon, Sun } from 'lucide-react';

interface Machine {
    id: number;
    name: string;
    code: string;
    active: boolean;
}

interface Template {
    id: number;
    name: string;
    machineId: number;
}

export default function Dashboard() {
    const { t, language, setLanguage } = useLanguage();
    const { isDark, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [machines, setMachines] = useState<Machine[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [machinesRes, templatesRes] = await Promise.all([
                machineApi.getAll(),
                templateApi.getAll()
            ]);
            setMachines(machinesRes.data.data || []);
            setTemplates(templatesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMachineSelect = (machine: Machine) => {
        setSelectedMachine(machine);
        setShowTemplateModal(true);
    };

    const handleStartQc = (templateId: number) => {
        if (selectedMachine) {
            navigate(`/qc-entry/${templateId}?machineId=${selectedMachine.id}`);
        }
    };

    const getTemplatesForMachine = (machineId: number) => {
        return templates.filter(t => t.machineId === machineId);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeTemplateModal = () => {
        setShowTemplateModal(false);
    };

    const machineTemplates = selectedMachine ? getTemplatesForMachine(selectedMachine.id) : [];

    // Color palette for template cards
    const templateColors = [
        { from: 'from-teal-500', to: 'to-emerald-600', shadow: 'shadow-teal-500/30' },
        { from: 'from-blue-500', to: 'to-cyan-600', shadow: 'shadow-blue-500/30' },
        { from: 'from-purple-500', to: 'to-pink-600', shadow: 'shadow-purple-500/30' },
        { from: 'from-orange-500', to: 'to-amber-600', shadow: 'shadow-orange-500/30' },
        { from: 'from-rose-500', to: 'to-red-600', shadow: 'shadow-rose-500/30' },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <header className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Saphire</h1>
                        <p className="text-white/80 text-sm">{user?.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/history')}
                            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            title={t.common.history}
                        >
                            <History size={22} />
                        </button>
                        <button
                            onClick={() => setTheme(isDark ? 'light' : 'dark')}
                            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            title={isDark ? t.theme.light : t.theme.dark}
                        >
                            {isDark ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'tr' : 'en')}
                            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            title={language === 'en' ? 'Türkçe' : 'English'}
                        >
                            <Globe size={22} />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6">
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">{t.dashboard.title}</h2>
                <p className="text-[var(--color-text-secondary)] mb-6">{t.dashboard.subtitle}</p>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {machines.filter(m => m.active).map((machine) => {
                            const machineTemplateCount = getTemplatesForMachine(machine.id).length;

                            return (
                                <button
                                    key={machine.id}
                                    onClick={() => handleMachineSelect(machine)}
                                    className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-5 transition-all hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 active:scale-98 text-left"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                                            <Cog size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-[var(--color-text)]">{machine.name}</h3>
                                            <p className="text-sm text-[var(--color-text-secondary)] font-mono">{machine.code}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-3 py-1 bg-teal-500/10 text-teal-600 rounded-full text-sm font-medium">
                                                    {machineTemplateCount} Şablon
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight size={24} className="text-teal-500 mt-2" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!loading && machines.filter(m => m.active).length === 0 && (
                    <div className="text-center py-12 text-[var(--color-text-secondary)]">
                        <Cog size={48} className="mx-auto mb-4 opacity-50" />
                        <p>{t.dashboard.noMachines}</p>
                    </div>
                )}
            </main>

            {/* ===== TEMPLATE SELECTION MODAL (Full Screen) ===== */}
            {showTemplateModal && selectedMachine && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                        onClick={closeTemplateModal}
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex flex-col animate-slide-up">
                        {/* Modal Header - Gradient */}
                        <div className="bg-gradient-to-r from-teal-600 to-emerald-500 text-white px-6 py-5 flex items-center justify-between shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Cog size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedMachine.name}</h2>
                                    <p className="text-white/80">{selectedMachine.code}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeTemplateModal}
                                className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div className="flex-1 bg-[var(--color-bg)] overflow-y-auto p-6">
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                                {t.templateModal.title}
                            </h3>
                            <p className="text-[var(--color-text-secondary)] mb-6">
                                {t.templateModal.subtitle}
                            </p>

                            {machineTemplates.length > 0 ? (
                                <div className="space-y-4">
                                    {machineTemplates.map((template, index) => {
                                        const colorScheme = templateColors[index % templateColors.length];

                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => handleStartQc(template.id)}
                                                className={`
                                                    template-card w-full flex items-center gap-5 p-5 
                                                    bg-gradient-to-r ${colorScheme.from} ${colorScheme.to}
                                                    rounded-2xl text-white text-left
                                                    shadow-xl ${colorScheme.shadow}
                                                    hover:scale-[1.02] active:scale-[0.98]
                                                    transition-all duration-200
                                                    touch-target
                                                `}
                                            >
                                                {/* Big Icon */}
                                                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                                                    <ClipboardCheck size={32} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xl font-bold truncate">
                                                        {template.name}
                                                    </h4>
                                                    <p className="text-white/80 text-sm mt-1">
                                                        {t.templateModal.tapToFill}
                                                    </p>
                                                </div>

                                                {/* Play Icon */}
                                                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse-glow">
                                                    <Play size={28} className="ml-1" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border-2 border-dashed border-[var(--color-border)]">
                                    <ClipboardCheck size={56} className="mx-auto mb-4 text-[var(--color-text-secondary)] opacity-50" />
                                    <p className="text-lg text-[var(--color-text-secondary)]">
                                        {t.templateModal.noTemplates}
                                    </p>
                                    <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                                        {t.templateModal.addFromAdmin}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-[var(--color-surface)] border-t border-[var(--color-border)] p-4">
                            <button
                                onClick={closeTemplateModal}
                                className="w-full py-4 rounded-xl border-2 border-[var(--color-border)] text-[var(--color-text)] font-medium text-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                            >
                                {t.common.back}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

