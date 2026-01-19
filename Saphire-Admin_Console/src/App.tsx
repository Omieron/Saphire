import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { SidebarProvider } from './contexts/SidebarContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Companies from './pages/Companies/Companies';
import Locations from './pages/Locations/Locations';
import Machines from './pages/Machines/Machines';
import Products from './pages/Products/Products';
import Users from './pages/Users/Users';

import QcTemplates from './pages/QcTemplates/QcTemplates';
import QcRecords from './pages/QcRecords/QcRecords';
import OnboardingTour from './components/Onboarding/OnboardingTour';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
            <OnboardingTour />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="locations" element={<Locations />} />
        <Route path="machines" element={<Machines />} />
        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />

        <Route path="qc-templates" element={<QcTemplates />} />
        <Route path="qc-records" element={<QcRecords />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <OnboardingProvider>
            <SidebarProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </SidebarProvider>
          </OnboardingProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
