import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoadingScreen from './components/LoadingScreen';

import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import QcEntry from './pages/QcEntry/QcEntry';
import History from './pages/History/History';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/qc-entry/:templateId" element={<ProtectedRoute><QcEntry /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
    </Routes>
  );
}

function AppContent() {
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    // Initial load - show for 1 second minimum
    if (!isInitialized) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setShowLoading(false);
          setIsInitialized(true);
        }, 300);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Page transitions after initialization
    if (previousPath.current !== location.pathname) {
      previousPath.current = location.pathname;
      setShowLoading(true);
      setFadeOut(false);

      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setShowLoading(false), 300);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isInitialized]);

  return (
    <>
      {showLoading && (
        <div className={`fixed inset-0 z-[100] ${fadeOut ? 'animate-fade-out' : ''}`}>
          <LoadingScreen />
        </div>
      )}
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}


