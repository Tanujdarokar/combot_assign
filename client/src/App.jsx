import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { SubmitModal } from './components/SubmitModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

import { FeedPage } from './pages/FeedPage';
import { FeatureDetailPage } from './pages/FeatureDetailPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppContent() {
  const [toast, setToast] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenSubmitModal = () => {
    if (!user) {
      showToast('Please sign in to submit a feature idea', 'error');
      navigate('/login');
    } else {
      setSubmitModalOpen(true);
    }
  };

  const handleRequireAuth = () => {
    showToast('Please sign in to perform this action', 'error');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar
        onOpenSubmitModal={handleOpenSubmitModal}
        showToast={showToast}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <FeedPage
                key={feedRefreshKey}
                onOpenSubmitModal={handleOpenSubmitModal}
                onRequireAuth={handleRequireAuth}
              />
            }
          />
          <Route path="/posts/:id" element={<FeatureDetailPage showToast={showToast} onRequireAuth={handleRequireAuth} />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/login" element={<LoginPage showToast={showToast} />} />
          <Route path="/signup" element={<SignupPage showToast={showToast} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage showToast={showToast} />} />
          <Route path="/reset-password" element={<ResetPasswordPage showToast={showToast} />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage showToast={showToast} />
              </AdminRoute>
            }
          />
        </Routes>
      </main>

      <SubmitModal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        onSuccess={() => {
          setFeedRefreshKey((prev) => prev + 1);
        }}
        showToast={showToast}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
