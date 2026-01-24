import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { machineApi, templateApi, taskAssignmentApi } from '../../api';
import { History, X, ClipboardCheck, ArrowRight, LayoutList, Calendar, Play, Cog, LogOut } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';
import Header from '../../components/Header';

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

interface Task {
    id: number;
    templateId: number;
    templateName: string;
    machineId: number | null;
    machineName?: string | null;
    productId: number | null;
    productName?: string | null;
}

export default function Dashboard() {
    const { t } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [machines, setMachines] = useState<Machine[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

            // Fetch tasks if user is logged in
            if (user?.id) {
                const tasksRes = await taskAssignmentApi.getActiveTasks(user.id);
                setTasks(tasksRes.data.data || []);
            }
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

    const handleStartTask = (task: Task) => {
        let url = `/qc-entry/${task.templateId}?taskId=${task.id}`;
        if (task.machineId) url += `&machineId=${task.machineId}`;
        if (task.productId) url += `&productId=${task.productId}`;
        navigate(url);
    };

    const getTemplatesForMachine = (machineId: number) => {
        return templates.filter(t => t.machineId === machineId);
    };

    const closeTemplateModal = () => {
        setShowTemplateModal(false);
    };

    const machineTemplates = selectedMachine ? getTemplatesForMachine(selectedMachine.id) : [];


    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Header
                isDashboard
                rightActions={
                    <>
                        <button
                            onClick={() => navigate('/history')}
                            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            title={t.common.history}
                        >
                            <History size={22} />
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                            title={t.settings.title}
                        >
                            <Cog size={22} />
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="p-3 bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-900/30 border border-red-500/50"
                            title={t.settings.logout}
                        >
                            <LogOut size={22} className="text-white" />
                        </button>
                    </>
                }
            />

            <main className="p-6">
                <div className="app-container">
                    {/* Active Tasks Section */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <LayoutList className="text-teal-500" size={24} />
                            <h2 className="text-2xl font-bold text-[var(--color-text)]">{t.dashboard.activeTasks}</h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="h-32 bg-[var(--color-surface)] animate-pulse rounded-2xl border-2 border-[var(--color-border)]" />
                            </div>
                        ) : tasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tasks.map((task) => (
                                    <button
                                        key={task.id}
                                        onClick={() => handleStartTask(task)}
                                        className="relative flex flex-col p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-left transition-all active:scale-[0.98] group hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/5 shadow-sm admin-card admin-card-hover"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
                                                <Calendar size={24} />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="px-3 py-1 bg-teal-500/10 text-teal-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
                                                    {task.machineName}
                                                </span>
                                                {task.productId && (
                                                    <span className="mt-1 px-3 py-1 bg-gray-500/10 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-500/10">
                                                        P: {task.productId}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-[var(--color-text)] group-hover:text-teal-600 transition-colors mb-1">{task.templateName}</h3>
                                            <p className="text-sm text-[var(--color-text-secondary)]"># {task.id}</p>
                                        </div>

                                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                                            {t.dashboard.startTask} <ArrowRight size={16} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)] rounded-2xl p-8 text-center text-[var(--color-text-secondary)]">
                                <p>{t.dashboard.noActiveTasks}</p>
                            </div>
                        )}
                    </div>

                    {/* Manual Machine Browse Section */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Cog className="text-teal-500" size={24} />
                            <h2 className="text-2xl font-bold text-[var(--color-text)]">{t.dashboard.allMachines}</h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-[var(--color-surface)] animate-pulse rounded-2xl border-2 border-[var(--color-border)]" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {machines.filter(m => m.active).map((machine) => {
                                    const machineTemplateCount = getTemplatesForMachine(machine.id).length;

                                    return (
                                        <button
                                            key={machine.id}
                                            onClick={() => handleMachineSelect(machine)}
                                            className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-4 transition-all hover:border-teal-500/50 hover:shadow-lg active:scale-98 text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                                                    <Cog size={24} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-[var(--color-text)] truncate">{machine.name}</h3>
                                                    <p className="text-xs text-[var(--color-text-secondary)]">{machineTemplateCount} {t.dashboard.templateCount}</p>
                                                </div>
                                                <ArrowRight size={20} className="text-teal-500/50" />
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
                    </div>
                </div>
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
                        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white px-6 py-5 flex items-center justify-between shadow-lg">
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

                        <div className="flex-1 bg-[var(--color-bg)] overflow-y-auto p-6 pb-20">
                            <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                                {t.templateModal.title}
                            </h3>
                            <p className="text-[var(--color-text-secondary)] mb-6">
                                {t.templateModal.subtitle}
                            </p>

                            {machineTemplates.length > 0 ? (
                                <div className="space-y-4">
                                    {machineTemplates.map((template: Template) => {
                                        return (
                                            <button
                                                key={template.id}
                                                onClick={() => handleStartQc(template.id)}
                                                className={`
                                                    template-card w-full flex items-center gap-5 p-5 
                                                    bg-gradient-to-r from-teal-600 to-teal-500
                                                    rounded-2xl text-white text-left
                                                    shadow-lg shadow-teal-500/10
                                                    hover:scale-[1.01] active:scale-[0.98]
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

                    </div>
                </>
            )}

            {/* Logout Confirmation */}
            <ConfirmModal
                show={showLogoutConfirm}
                title={t.settings.logout}
                message={t.qcEntry.exitConfirm}
                confirmText={t.settings.logout}
                cancelText={t.common.cancel}
                confirmColor="red"
                onConfirm={() => {
                    logout();
                    navigate('/login');
                }}
                onCancel={() => setShowLogoutConfirm(false)}
            />
        </div>
    );
}

