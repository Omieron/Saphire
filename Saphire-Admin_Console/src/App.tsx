import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout/Layout';
import PageLoader from './components/PageLoader/PageLoader';
import StatusModal from './components/StatusModal/StatusModal';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Companies from './pages/Companies/Companies';
import Locations from './pages/Locations/Locations';
import Machines from './pages/Machines/Machines';
import Products from './pages/Products/Products';
import Users from './pages/Users/Users';
import QcTemplates from './pages/QcTemplates/QcTemplates';
import QcRecords from './pages/QcRecords/QcRecords';
import QcApprovalQueue from './pages/QcApprovalQueue/QcApprovalQueue';
import Settings from './pages/Settings/Settings';
import Tasks from './pages/Tasks/Tasks';
import OnboardingTour from './components/Onboarding/OnboardingTour';

// Protected Route wrapper
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function GlobalUIWrapper() {
  const { sessionExpired, clearSessionExpired, logout, connectionError, clearConnectionError } = useAuth();
  const { t } = useLanguage();

  const handleSessionConfirm = () => {
    logout();
    clearSessionExpired();
  };

  return (
    <>
      <PageLoader />
      <Outlet />
      <StatusModal
        isOpen={sessionExpired}
        onClose={handleSessionConfirm}
        title={t.auth.sessionExpired}
        message={t.auth.sessionExpiredMessage}
        type="warning"
      />
      <StatusModal
        isOpen={connectionError}
        onClose={clearConnectionError}
        title={t.common.connectionError}
        message={t.common.connectionErrorMessage}
        type="error"
      />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <GlobalUIWrapper />,
    children: [
      { path: '/login', element: <Login /> },
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <>
                <Layout />
                <OnboardingTour />
              </>
            ),
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'companies', element: <Companies /> },
              { path: 'locations', element: <Locations /> },
              { path: 'machines', element: <Machines /> },
              { path: 'products', element: <Products /> },
              { path: 'users', element: <Users /> },
              { path: 'qc-templates', element: <QcTemplates /> },
              { path: 'qc-approval', element: <QcApprovalQueue /> },
              { path: 'qc-records', element: <QcRecords /> },
              { path: 'tasks', element: <Tasks /> },
              { path: 'settings', element: <Settings /> },
            ]
          }
        ]
      }
    ]
  }
]);

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <OnboardingProvider>
              <SidebarProvider>
                <RouterProvider router={router} />
              </SidebarProvider>
            </OnboardingProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
