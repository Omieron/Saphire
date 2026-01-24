import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { machineApi, taskAssignmentApi } from '../../api';
import {
    Cpu,
    ChevronRight,
    Calendar,
    ArrowRight,
    History,
    Cog,
    LogOut,
    LayoutList
} from 'lucide-react';
import Header from '../../components/Header';
import ConfirmModal from '../../components/ConfirmModal';

interface Task {
    id: number;
    machineName: string;
    machineId: number;
    templateName: string;
    templateId: number;
    productId?: number;
    productName?: string;
    active: boolean;
}

interface Machine {
    id: number;
    name: string;
    code: string;
    status: string;
    lastControlAt?: string;
}

export default function Dashboard() {
    const { t } = useLanguage();
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [tasksRes, machinesRes] = await Promise.all([
                taskAssignmentApi.getActiveTasks(user.id),
                machineApi.getAll()
            ]);
            setTasks(tasksRes.data.data || []);
            setMachines(machinesRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartTask = (task: Task) => {
        navigate(`/qc-entry/${task.templateId}?machineId=${task.machineId}${task.productId ? `&productId=${task.productId}` : ''}&taskId=${task.id}`);
    };

    const handleTaskClick = (task: Task) => {
        handleStartTask(task);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const categories = [
        { id: 0, name: t.dashboard.activeTasks },
        { id: 1, name: 'Hattaki Ürünler' },
        { id: 2, name: 'Bekleyen Bakımlar' }
    ];

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-col animate-fade-in">
            <ConfirmModal
                show={showLogoutConfirm}
                title={t.settings.logout}
                message={t.qcEntry.exitConfirm}
                onConfirm={handleLogout}
                onCancel={() => setShowLogoutConfirm(false)}
                confirmText={t.settings.logout}
                confirmColor="red"
            />

            <Header
                isDashboard
                rightActions={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/history')}
                            className="p-3 bg-white/20 text-white rounded-xl shadow-lg border border-white/30 active:scale-90 transition-all"
                            title={t.common.history}
                        >
                            <History size={22} />
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-3 bg-white/20 text-white rounded-xl shadow-lg border border-white/30 active:scale-90 transition-all"
                            title={t.settings.title}
                        >
                            <Cog size={22} />
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="p-3 bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/20 border-2 border-red-400/50 active:scale-90 transition-all"
                            title={t.settings.logout}
                        >
                            <LogOut size={22} />
                        </button>
                    </div>
                }
            />

            <main className="p-4 sm:p-6 lg:p-8">
                <div className="app-container space-y-10">
                    {/* Active Tasks Grid */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <LayoutList className="text-[var(--color-primary)]" size={24} />
                            <h2 className="text-2xl font-black text-[var(--color-text)] uppercase tracking-tight">{t.dashboard.activeTasks}</h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-[var(--color-surface)] rounded-2xl animate-pulse border border-[var(--color-border)] opacity-50" />
                                ))}
                            </div>
                        ) : tasks.length === 0 ? (
                            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-10 text-center shadow-sm">
                                <p className="text-[var(--color-text-secondary)] font-bold">{t.dashboard.noActiveTasks}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tasks.map((task) => (
                                    <button
                                        key={task.id}
                                        onClick={() => handleStartTask(task)}
                                        className="relative flex flex-col p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl text-left transition-all active:scale-[0.98] group hover:border-[var(--color-primary)] hover:shadow-xl hover:shadow-[var(--color-primary-soft)] shadow-sm admin-card"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 bg-[var(--color-primary-soft)] rounded-2xl flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                                                <Calendar size={28} />
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="px-3 py-1 bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-full text-[10px] font-black uppercase tracking-wider border border-[var(--color-primary-soft)]">
                                                    {task.machineName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors mb-1 uppercase tracking-tight">{task.templateName}</h3>
                                            {task.productName && (
                                                <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">{task.productName}</p>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--color-primary)] group-hover:translate-x-1 transition-transform">
                                            {t.dashboard.startTask} <ArrowRight size={18} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* All Machines Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Cpu className="text-[var(--color-primary)]" size={24} />
                            <h2 className="text-2xl font-black text-[var(--color-text)] uppercase tracking-tight">{t.dashboard.allMachines}</h2>
                        </div>

                        {/* Categories Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${selectedCategory === cat.id
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/20'
                                        : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-teal-500/50'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-40 bg-[var(--color-surface)] rounded-3xl animate-pulse border border-[var(--color-border)] opacity-50" />
                                ))
                            ) : machines.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-[var(--color-text-secondary)] font-bold">{t.dashboard.noMachines}</p>
                                </div>
                            ) : (
                                machines.map((machine) => (
                                    <div
                                        key={machine.id}
                                        onClick={() => handleTaskClick(machine as any)}
                                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 admin-card cursor-pointer group active:scale-[0.98] transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 bg-[var(--color-primary-soft)] rounded-2xl flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                                                <Cpu size={32} />
                                            </div>
                                            {machine.status === 'ACTIVE' && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-success-soft)] text-[var(--color-success)] rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--color-success-soft)]">
                                                    <div className="w-1.5 h-1.5 bg-[var(--color-success)] rounded-full animate-pulse" />
                                                    Online
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-black text-[var(--color-text)] mb-1 uppercase tracking-tighter">{machine.name}</h3>
                                            <p className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">{machine.code}</p>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex items-center justify-between text-[var(--color-primary)]">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t.dashboard.startQc}</span>
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
