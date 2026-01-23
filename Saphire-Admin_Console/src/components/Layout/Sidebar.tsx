import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSidebar } from '../../contexts/SidebarContext';
import {
    LayoutDashboard,
    Building2,
    MapPin,
    Cog,
    Package,
    Users as UsersIcon,
    ClipboardList,
    FileCheck,
    ChevronLeft,
    ChevronDown,
    ChevronRight,
    Menu,
    Settings as SettingsIcon,
    User,
    CalendarCheck,
} from 'lucide-react';

export default function Sidebar() {
    const { t } = useLanguage();
    const { collapsed, toggleCollapsed } = useSidebar();
    const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev =>
            prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
        );
    };

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: t.sidebar.dashboard },
        { type: 'divider', label: t.sidebar.masterData, tourId: 'master-data' },
        { path: '/companies', icon: Building2, label: t.sidebar.companies },
        { path: '/locations', icon: MapPin, label: t.sidebar.locations },
        { path: '/machines', icon: Cog, label: t.sidebar.machines },
        { path: '/products', icon: Package, label: t.sidebar.products },
        {
            label: t.sidebar.users,
            icon: UsersIcon,
            subItems: [
                { path: '/users', label: t.sidebar.users, icon: User },
                { path: '/tasks', label: t.tasks.title, icon: CalendarCheck },
            ]
        },
        { type: 'divider', label: t.sidebar.qc, tourId: 'qc' },
        { path: '/qc-templates', icon: ClipboardList, label: t.sidebar.qcTemplates },
        { path: '/qc-approval', icon: FileCheck, label: t.qcRecords.reviewQueue },
        { path: '/qc-records', icon: ClipboardList, label: t.sidebar.qcRecords },
        { type: 'divider', label: t.sidebar.system, tourId: 'system' },
        { path: '/settings', icon: SettingsIcon, label: t.sidebar.settings },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-[var(--color-sidebar)] text-[var(--color-sidebar-text)] transition-all duration-300 z-50 flex flex-col ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
                {!collapsed && (
                    <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent truncate">
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
                                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                    {item.label}
                                </span>
                            </div>
                        ) : (
                            <div key={index} className="my-3 mx-2 border-t border-white/10" />
                        );
                    }

                    const Icon = item.icon!;
                    const hasSubItems = 'subItems' in item && item.subItems;
                    const isExpanded = expandedMenus.includes(item.label!);

                    if (hasSubItems) {
                        return (
                            <div key={item.label} className="relative">
                                <button
                                    onClick={() => !collapsed && toggleMenu(item.label!)}
                                    className={`flex items-center gap-3 px-3 py-2.5 mx-auto rounded-xl transition-all duration-300 text-[15px] group relative ${collapsed
                                        ? 'justify-center w-12 h-12 mb-2 p-0'
                                        : 'w-[calc(100%-24px)] mb-1 hover:bg-white/5 text-slate-300 hover:text-white'
                                        }`}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <div className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'group-hover:scale-110' : ''}`}>
                                        <Icon
                                            size={collapsed ? 22 : 20}
                                            className="flex-shrink-0 transition-all duration-300 drop-shadow-sm"
                                        />
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <span className="font-medium truncate flex-1 text-left">{item.label}</span>
                                            {isExpanded ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
                                        </>
                                    )}
                                </button>
                                {!collapsed && isExpanded && (
                                    <div className="mt-1 ml-6 pl-4 border-l border-white/5 space-y-1">
                                        {item.subItems!.map(sub => (
                                            <NavLink
                                                key={sub.path}
                                                to={sub.path}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${isActive
                                                        ? 'bg-teal-500/15 text-teal-400 font-semibold shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                                                        : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                                    }`
                                                }
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        {sub.icon ? (
                                                            <sub.icon
                                                                size={16}
                                                                className={`transition-colors duration-300 ${isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                                                            />
                                                        ) : (
                                                            <div className={`w-1 h-3 rounded-full transition-all ${isActive ? 'bg-teal-500 scale-y-125' : 'bg-slate-600'}`} />
                                                        )}
                                                        <span className="truncate">{sub.label}</span>
                                                    </>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path!}
                            title={collapsed ? item.label : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 mx-auto rounded-xl transition-all duration-300 text-[15px] group relative ${isActive
                                    ? 'active bg-teal-500/15 text-teal-400 font-semibold shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                                    : 'hover:bg-white/5 text-slate-300 hover:text-white'
                                } ${collapsed
                                    ? 'justify-center w-12 h-12 mb-2 p-0'
                                    : 'w-[calc(100%-24px)] mb-1'
                                }`
                            }
                        >
                            {/* Active Indicator Line */}
                            <div
                                className={`absolute left-0 w-1 h-6 bg-teal-500 rounded-r-full transition-all duration-300 origin-left opacity-0 translate-x-1/2 group-[.active]:opacity-100 group-[.active]:translate-x-0 ${collapsed ? '-left-[6px]' : '-left-3'
                                    }`}
                            />

                            <div className={`flex items-center justify-center transition-all duration-300 ${collapsed ? 'group-hover:scale-110' : ''}`}>
                                <Icon
                                    size={collapsed ? 22 : 20}
                                    className="flex-shrink-0 transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                                />
                            </div>
                            {!collapsed && <span className="font-medium truncate flex-1">{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
}
