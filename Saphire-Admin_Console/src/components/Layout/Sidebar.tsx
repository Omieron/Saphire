import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSidebar } from '../../contexts/SidebarContext';
import {
    LayoutDashboard,
    Building2,
    MapPin,
    Cog,
    Package,
    Users,
    ClipboardList,
    FileCheck,
    LogOut,
    ChevronLeft,
    Menu,
} from 'lucide-react';

export default function Sidebar() {
    const { logout, user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { collapsed, toggleCollapsed } = useSidebar();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: t.sidebar.dashboard },
        { type: 'divider', label: t.sidebar.masterData, tourId: 'master-data' },
        { path: '/companies', icon: Building2, label: t.sidebar.companies },
        { path: '/locations', icon: MapPin, label: t.sidebar.locations },
        { path: '/machines', icon: Cog, label: t.sidebar.machines },
        { path: '/products', icon: Package, label: t.sidebar.products },
        { path: '/users', icon: Users, label: t.sidebar.users },
        { type: 'divider', label: t.sidebar.qc, tourId: 'qc' },
        { path: '/qc-templates', icon: ClipboardList, label: t.sidebar.qcTemplates },
        { path: '/qc-approval', icon: FileCheck, label: t.qcRecords.reviewQueue },
        { path: '/qc-records', icon: ClipboardList, label: t.sidebar.qcRecords },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
                {!collapsed && (
                    <span className="text-lg font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent truncate">
                        Saphire
                    </span>
                )}
                <button
                    onClick={toggleCollapsed}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                    title={collapsed ? 'Expand' : 'Collapse'}
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3">
                {menuItems.map((item, index) => {
                    if (item.type === 'divider') {
                        return !collapsed ? (
                            <div
                                key={index}
                                className="px-4 py-2 mt-3 first:mt-0"
                                data-tour={item.tourId}
                            >
                                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">
                                    {item.label}
                                </span>
                            </div>
                        ) : (
                            <div key={index} className="my-3 mx-2 border-t border-white/10" />
                        );
                    }

                    const Icon = item.icon!;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path!}
                            title={collapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg transition-all text-sm ${isActive
                                    ? 'bg-teal-500/20 text-teal-400'
                                    : 'hover:bg-white/5 text-slate-300 hover:text-white'
                                } ${collapsed ? 'justify-center px-0' : ''}`
                            }
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && <span className="font-medium truncate">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User & Logout */}
            <div className="p-3 border-t border-white/10">
                {!collapsed && user && (
                    <div className="mb-2 px-2">
                        <p className="font-medium text-sm truncate">{user.fullName}</p>
                        <p className="text-xs text-white/50 truncate">{user.role}</p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    title={collapsed ? t.auth.logout : undefined}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm ${collapsed ? 'justify-center' : ''
                        }`}
                >
                    <LogOut size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="font-medium">{t.auth.logout}</span>}
                </button>
            </div>
        </aside>
    );
}
