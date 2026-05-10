import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageLayout from './components/layout/PageLayout';
import Dashboard from './pages/Dashboard';
import AllLeads from './pages/AllLeads';
import LeadForm from './pages/LeadForm';
import SearchPage from './pages/SearchPage';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { LeadProvider } from './context/LeadContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <LeadProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <PageLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/leads" element={<AllLeads />} />
                      <Route path="/leads/new" element={<LeadForm />} />
                      <Route path="/leads/:id" element={<LeadForm />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </PageLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </ToastProvider>
      </LeadProvider>
    </AuthProvider>
  );
}

export default App;
