import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '../../contexts/SidebarContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Layout() {
    const location = useLocation();
    const { collapsed } = useSidebar();
    const { t } = useLanguage();

    // Dynamic page titles based on current language
    const pageTitles: Record<string, string> = {
        '/': t.sidebar.dashboard,
        '/companies': t.sidebar.companies,
        '/locations': t.sidebar.locations,
        '/machines': t.sidebar.machines,
        '/products': t.sidebar.products,
        '/users': t.sidebar.users,
        '/qc-templates': t.qcTemplates.title,
        '/qc-approval': t.qcRecords.reviewQueue,
        '/qc-records': t.qcRecords.title,
        '/settings': t.settings.title,
    };

    const title = pageTitles[location.pathname] || 'Saphire Admin';

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <Sidebar />
            <div
                className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-64'}`}
            >
                <Header title={title} />
                <main className="p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
