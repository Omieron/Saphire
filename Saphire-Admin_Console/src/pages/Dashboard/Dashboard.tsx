import { useEffect, useState } from 'react';
import { Building2, MapPin, Cog, Package, Users, ClipboardList, Plus, ArrowRight, Activity, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../../api/company.api';
import { locationApi } from '../../api/location.api';
import { machineApi } from '../../api/machine.api';
import { productApi } from '../../api/product.api';
import { userApi } from '../../api/user.api';
import { qcTemplateApi } from '../../api/qcTemplate.api';
import { useLanguage } from '../../contexts/LanguageContext';

interface StatCard {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    path: string;
}

export default function Dashboard() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ companies: 0, locations: 0, machines: 0, products: 0, users: 0, templates: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [companies, locations, machines, products, users, templates] = await Promise.all([
                    companyApi.getAll(), locationApi.getAll(), machineApi.getAll(),
                    productApi.getAll(), userApi.getAll(), qcTemplateApi.getAll(),
                ]);
                setStats({
                    companies: companies.data.data?.length || 0,
                    locations: locations.data.data?.length || 0,
                    machines: machines.data.data?.length || 0,
                    products: products.data.data?.length || 0,
                    users: users.data.data?.length || 0,
                    templates: templates.data.data?.length || 0,
                });
            } catch (error) { console.error('Failed to fetch stats:', error); }
            finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    const statCards: StatCard[] = [
        { label: t.sidebar.companies, value: stats.companies, icon: Building2, color: 'from-blue-500 to-cyan-500', path: '/companies' },
        { label: t.sidebar.locations, value: stats.locations, icon: MapPin, color: 'from-green-500 to-emerald-500', path: '/locations' },
        { label: t.sidebar.machines, value: stats.machines, icon: Cog, color: 'from-orange-500 to-amber-500', path: '/machines' },
        { label: t.sidebar.products, value: stats.products, icon: Package, color: 'from-purple-500 to-pink-500', path: '/products' },
        { label: t.sidebar.users, value: stats.users, icon: Users, color: 'from-teal-500 to-cyan-500', path: '/users' },
        { label: t.sidebar.qcTemplates, value: stats.templates, icon: ClipboardList, color: 'from-rose-500 to-red-500', path: '/qc-templates' },
    ];

    const quickActions = [
        { label: t.dashboard.addCompany, icon: Building2, path: '/companies', action: 'add' },
        { label: t.dashboard.addLocation, icon: MapPin, path: '/locations', action: 'add' },
        { label: t.dashboard.addMachine, icon: Cog, path: '/machines', action: 'add' },
        { label: t.dashboard.addProduct, icon: Package, path: '/products', action: 'add' },
        { label: t.dashboard.createTemplate, icon: ClipboardList, path: '/qc-templates', action: 'add' },
        { label: t.dashboard.newProduction, icon: Plus, path: '/instances', action: 'add' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        onClick={() => navigate(card.path)}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 cursor-pointer hover:border-teal-500/50 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                                <card.icon size={24} className="text-white" />
                            </div>
                            <ArrowRight size={20} className="text-[var(--color-text-secondary)] group-hover:text-teal-500 transition-colors" />
                        </div>
                        <p className="text-3xl font-bold text-[var(--color-text)] mb-1">
                            {loading ? '-' : card.value}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{card.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t.dashboard.quickActions}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                className="flex items-center gap-3 p-3 bg-[var(--color-bg)] rounded-lg hover:bg-teal-500/10 hover:border-teal-500/50 border border-transparent transition-all text-left"
                            >
                                <action.icon size={18} className="text-teal-500" />
                                <span className="text-sm text-[var(--color-text)]">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4">{t.dashboard.systemStatus}</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg">
                            <div className="flex items-center gap-3">
                                <Activity size={18} className="text-green-500" />
                                <span className="text-sm text-[var(--color-text)]">{t.dashboard.apiServer}</span>
                            </div>
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium">{t.dashboard.online}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg">
                            <div className="flex items-center gap-3">
                                <Database size={18} className="text-green-500" />
                                <span className="text-sm text-[var(--color-text)]">{t.dashboard.database}</span>
                            </div>
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-medium">{t.dashboard.connected}</span>
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] text-right">
                            {t.dashboard.lastUpdated}: {t.dashboard.justNow}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
