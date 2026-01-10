import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { newsAPI } from './services/api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Task from './pages/Task';
import Wealth from './pages/Wealth';
import WealthDetail from './pages/WealthDetail';
import MyInvestments from './pages/MyInvestments';
import Mine from './pages/Mine';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Mail from './pages/Mail';
import Settings from './pages/Settings';
import CompanyNews from './pages/CompanyNews';
import QnA from './pages/QnA';
import TierList from './pages/TierList';
import Team from './pages/Team';
import SpinWheel from './pages/SpinWheel';
import AppRules from './pages/AppRules';
import Courses from './pages/Courses';

// Components
import NewsPopup from './components/NewsPopup';

// Layout
import MainLayout from './layout/MainLayout';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { verifyToken, isAuthenticated, shouldShowNewsPopup, latestNews, setLatestNews, hideNewsPopup } = useAuthStore();
  const [frontendDisabled, setFrontendDisabled] = useState(false);
  const [systemSettingsLoading, setSystemSettingsLoading] = useState(true);

  useEffect(() => {
    verifyToken();
    checkSystemSettings();
  }, [verifyToken]);

  // Fetch latest popup news when user logs in
  useEffect(() => {
    if (isAuthenticated && shouldShowNewsPopup) {
      fetchPopupNews();
    }
  }, [isAuthenticated, shouldShowNewsPopup]);

  const fetchPopupNews = async () => {
    try {
      const response = await newsAPI.getPopupNews();
      if (response.data.success && response.data.news) {
        setLatestNews(response.data.news);
      }
    } catch (error) {
      console.error('Failed to fetch popup news:', error);
    }
  };

  const handleCloseNewsPopup = () => {
    hideNewsPopup();
  };

  const checkSystemSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/system/settings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch system settings');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setFrontendDisabled(data.settings?.frontendDisabled || false);
      }
    } catch (error) {
      console.error('Failed to check system settings:', error);
      // Don't block the app if system settings fail to load
      setFrontendDisabled(false);
    } finally {
      setSystemSettingsLoading(false);
    }
  };

  // Show white page if frontend is disabled
  if (!systemSettingsLoading && frontendDisabled) {
    return (
      <div className="min-h-screen bg-white">
        {/* Completely white page - no content */}
      </div>
    );
  }

  // Show loading spinner while checking system settings
  if (systemSettingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      {/* News Popup - Shows on login/register */}
      {shouldShowNewsPopup && latestNews && (
        <NewsPopup news={latestNews} onClose={handleCloseNewsPopup} />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="task" element={<Task />} />
          <Route path="wealth" element={<Wealth />} />
          <Route path="wealth/:id" element={<WealthDetail />} />
          <Route path="my-investments" element={<MyInvestments />} />
          <Route path="mine" element={<Mine />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="mail" element={<Mail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="news" element={<CompanyNews />} />
          <Route path="qna" element={<QnA />} />
          <Route path="tiers" element={<TierList />} />
          <Route path="team" element={<Team />} />
          <Route path="spin" element={<SpinWheel />} />
          <Route path="app-rules" element={<AppRules />} />
          <Route path="courses" element={<Courses />} />
        </Route>


        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;