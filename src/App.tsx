import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Components
import Navbar from "./components/Layout/Navbar";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import UserProfile from "./components/Auth/UserProfile";
import PremiumPlans from "./components/Premium/PremiumPlans";
import TrendyolIntegration from "./components/Integration/TrendyolIntegration";
import SellerPanel from "./components/Panel/SellerPanel";
import ProfitCalculator from "./components/Calculator/ProfitCalculator";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/giris" />;
}

// Public Route Component (redirect if logged in)
function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Protected Routes */}
          <Route path="/" element={<ProfitCalculator />} />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ayarlar"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Hesap Ayarları
                    </h1>
                    <p className="text-gray-600">Bu modül yakında eklenecek!</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/entegrasyon"
            element={
              <ProtectedRoute>
                <TrendyolIntegration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel"
            element={
              <ProtectedRoute>
                <SellerPanel />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route
            path="/giris"
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            }
          />
          <Route
            path="/kayit"
            element={
              <PublicRoute>
                <RegisterForm />
              </PublicRoute>
            }
          />

          {/* Placeholder routes for future modules */}
          <Route
            path="/ai-chat"
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      AI Asistan
                    </h1>
                    <p className="text-gray-600">Bu modül yakında eklenecek!</p>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <PremiumPlans />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
