import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import DrugInteractionsPage from "./pages/DrugInteractionsPage";
import RemindersPage from "./pages/RemindersPage";
import HospitalsPage from "./pages/HospitalsPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#8C907E] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs uppercase tracking-widest text-[#8A8D83]">
            Loading clinical portal...
          </p>
        </div>
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes wrapped in Kaira Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/interactions"
        element={
          <ProtectedRoute>
            <Layout>
              <DrugInteractionsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reminders"
        element={
          <ProtectedRoute>
            <Layout>
              <RemindersPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute>
            <Layout>
              <HospitalsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
