import { useEffect, useState } from 'react';
import {
    Building2, Cog, Package, ClipboardList,
    ArrowRight, Activity, Database, TrendingUp, AlertCircle,
    CheckCircle2, XCircle, Clock, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, PieChart, Pie, Cell,
    BarChart, Bar, Legend
} from 'recharts';
import { dashboardApi } from '../../api/dashboard.api';
import type { DashboardData } from '../../api/dashboard.api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Dashboard() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredSegment, setHoveredSegment] = useState<{ name: string, value: number, color: string } | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await dashboardApi.getData();
                setData(response.data.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const statCards = [
        { label: t.sidebar.companies, value: data.summary.totalCompanies, icon: Building2, color: 'from-blue-500 to-cyan-500', path: '/companies' },
        { label: t.sidebar.machines, value: data.summary.totalMachines, icon: Cog, color: 'from-orange-500 to-amber-500', path: '/machines' },
        { label: t.sidebar.products, value: data.summary.totalProducts, icon: Package, color: 'from-purple-500 to-pink-500', path: '/products' },
        { label: t.dashboard.activeTasks, value: data.summary.activeTasks, icon: ClipboardList, color: 'from-rose-500 to-red-500', path: '/task-assignments' },
    ];

    const qcPieData = [
        { name: t.dashboard.passed, value: data.qcMetrics.passedCount, color: '#10b981' },
        { name: t.dashboard.failed, value: data.qcMetrics.failedCount, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Header section with welcome and date */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">{t.auth.welcome}, Admin</h1>
                    <p className="text-[var(--color-text-secondary)]">{t.dashboard.title} & {t.dashboard.systemStatus}</p>
                </div>
                <div className="flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)]">
                    <Calendar size={16} />
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        onClick={() => navigate(card.path)}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 cursor-pointer hover:border-teal-500/50 transition-all group overflow-hidden relative shadow-sm"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                                <card.icon size={24} className="text-white" />
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-[var(--color-text)]">{card.value}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{card.label}</p>
                            </div>
                        </div>
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${card.color} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                    </div>
                ))}
            </div>

            {/* Critical Alerts (Top Priority) */}
            {data.alerts.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={18} className="text-red-500" />
                        <h3 className="font-semibold text-red-500">{t.dashboard.criticalAlerts}</h3>
                    </div>
                    <div className="space-y-2">
                        {data.alerts.map((alert) => (
                            <div key={alert.id} className="flex items-start gap-3 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                <div className="p-1.5 bg-red-500 rounded-md mt-0.5">
                                    <Activity size={12} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text)]">{alert.title}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{alert.message}</p>
                                </div>
                                <span className="ml-auto text-[10px] text-red-500/60 font-medium whitespace-nowrap">
                                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QC Weekly Volume - Area Chart */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-[var(--color-text)]">{t.dashboard.weeklyVolume}</h3>
                        <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
                            <TrendingUp size={14} />
                            <span>12% {t.dashboard.performanceChange}</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.qcMetrics.weeklyTrend}>
                                <defs>
                                    <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        padding: '8px 12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                    }}
                                    itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="passed" stroke="#10b981" fillOpacity={1} fill="url(#colorPassed)" name={t.dashboard.passed} />
                                <Area type="monotone" dataKey="failed" stroke="#ef4444" fill="transparent" name={t.dashboard.failed} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* QC Breakdown - Pie Chart */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-[var(--color-text)] mb-6">{t.dashboard.qcBreakdown}</h3>
                    <div className="h-[300px] w-full relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={qcPieData}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={75}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={6}
                                    onMouseEnter={(_, index) => setHoveredSegment(qcPieData[index])}
                                    onMouseLeave={() => setHoveredSegment(null)}
                                >
                                    {qcPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" className="outline-none cursor-pointer" />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none transition-all duration-300">
                            {hoveredSegment ? (
                                <>
                                    <p className="text-4xl font-bold" style={{ color: hoveredSegment.color }}>
                                        {hoveredSegment.value}
                                    </p>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-widest mt-1">
                                        {hoveredSegment.name}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-3xl font-bold text-[var(--color-text)]">
                                        {data.qcMetrics.passRate.toFixed(1)}%
                                    </p>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-widest mt-1">
                                        {t.dashboard.passRate}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Machine Status - Bar Chart */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-[var(--color-text)] mb-6">{t.dashboard.machineStatus}</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data.machineMetrics.statusDistribution}
                                layout="vertical"
                                margin={{ left: 10, right: 30, top: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                                <XAxis type="number" axisLine={false} tickLine={false} hide />
                                <YAxis
                                    dataKey="status"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                    tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
                                    tickFormatter={(value) => (t.dashboard as any).machineStatuses?.[value] || value}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1E293B',
                                        border: '1px solid #334155',
                                        borderRadius: '12px',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                                    formatter={(value, _name, props) => [value, (t.dashboard as any).machineStatuses?.[props.payload.status] || props.payload.status]}
                                />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                    {data.machineMetrics.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products - List/Ranking */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold text-[var(--color-text)] mb-6">{t.dashboard.productPerformance}</h3>
                    <div className="space-y-4">
                        {data.productPerformance.map((product, index) => (
                            <div key={product.productName} className="flex items-center gap-4">
                                <span className="w-6 text-sm font-medium text-[var(--color-text-secondary)]">#0{index + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm font-medium text-[var(--color-text)]">{product.productName}</span>
                                        <span className="text-xs text-[var(--color-text-secondary)]">%{product.passRate.toFixed(0)}</span>
                                    </div>
                                    <div className="w-full bg-[var(--color-bg)] rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${product.passRate > 90 ? 'bg-green-500' : product.passRate > 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                                            style={{ width: `${product.passRate}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-[var(--color-text)]">{t.dashboard.recentActivity}</h3>
                        <button className="text-xs text-teal-500 hover:underline">{t.common.view} {t.common.all}</button>
                    </div>
                    <div className="space-y-4">
                        {data.activities.length === 0 ? (
                            <div className="text-center py-8 text-[var(--color-text-secondary)] text-sm italic">
                                {t.dashboard.noActivities}
                            </div>
                        ) : (
                            data.activities.map((activity) => (
                                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-[var(--color-bg)] rounded-lg transition-colors group">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.status === 'PASS' || activity.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                                        activity.status === 'FAIL' || activity.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                            'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        {activity.status === 'PASS' || activity.status === 'APPROVED' ? <CheckCircle2 size={20} /> :
                                            activity.status === 'FAIL' || activity.status === 'REJECTED' ? <XCircle size={20} /> :
                                                <Clock size={20} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-[var(--color-text)] truncate">{activity.description}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-[var(--color-text-secondary)]">{activity.userName}</span>
                                            <span className="w-1 h-1 bg-[var(--color-border)] rounded-full"></span>
                                            <span className="text-[10px] text-[var(--color-text-secondary)]">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <ArrowRight size={16} className="text-[var(--color-border)] group-hover:text-teal-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Status & Servers */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold text-[var(--color-text)] mb-6">{t.dashboard.systemStatus}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
                                <div className="flex items-center gap-3">
                                    <Activity size={18} className="text-green-500" />
                                    <span className="text-sm font-medium text-[var(--color-text)]">{t.dashboard.apiServer}</span>
                                </div>
                                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase">{t.dashboard.online}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
                                <div className="flex items-center gap-3">
                                    <Database size={18} className="text-green-500" />
                                    <span className="text-sm font-medium text-[var(--color-text)]">{t.dashboard.database}</span>
                                </div>
                                <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-[10px] font-bold uppercase">{t.dashboard.connected}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-bold mb-2 text-lg">Hızlı Rapor</h3>
                            <p className="text-teal-50/80 text-sm mb-4">Sistem verilerini Excel veya PDF olarak anında dışa aktarın.</p>
                            <button className="bg-white text-teal-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-50 transition-colors flex items-center gap-2">
                                <TrendingUp size={16} />
                                Rapor Oluştur
                            </button>
                        </div>
                        <TrendingUp size={120} className="absolute -right-8 -bottom-8 text-white/10 rotate-12 transform group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}
