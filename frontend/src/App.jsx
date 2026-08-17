import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import DonorList from './pages/DonorList';
import Profile from './pages/Profile';
import MyDonations from './pages/MyDonations';

import { LanguageProvider } from './context/LanguageContext';
import { LiveAlertProvider } from './context/LiveAlertContext';
import LiveToast from './components/LiveToast';

// Helper component for Route Guarding
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-request"
              element={
                <ProtectedRoute>
                  <CreateRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donors"
              element={
                <ProtectedRoute>
                  <DonorList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-donations"
              element={
                <ProtectedRoute>
                  <MyDonations />
                </ProtectedRoute>
              }
            />

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <LiveToast />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LiveAlertProvider>
          <AppContent />
        </LiveAlertProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
