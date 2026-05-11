import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { LeadProvider } from './context/LeadContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AllLeads = lazy(() => import('./pages/AllLeads'));
const LeadForm = lazy(() => import('./pages/LeadForm'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/Login'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>
    Loading...
  </div>
);

function App() {
  React.useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  return (
    <AuthProvider>
      <LeadProvider>
        <ToastProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route path="/*" element={
                  <ProtectedRoute>
                    <PageLayout>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/leads" element={<AllLeads />} />
                          <Route path="/leads/new" element={<LeadForm />} />
                          <Route path="/leads/:id" element={<LeadForm />} />
                          <Route path="/search" element={<SearchPage />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Suspense>
                    </PageLayout>
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </Router>
        </ToastProvider>
      </LeadProvider>
    </AuthProvider>
  );
}

export default App;
