import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { newsAPI, systemAPI } from './services/api';
import { SettingsProvider } from './contexts/SettingsContext';
import logo from './assets/logo.png';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Task = lazy(() => import('./pages/Task'));
const Wealth = lazy(() => import('./pages/Wealth'));
const WealthDetail = lazy(() => import('./pages/WealthDetail'));
const MyInvestments = lazy(() => import('./pages/MyInvestments'));
const Mine = lazy(() => import('./pages/Mine'));
const Deposit = lazy(() => import('./pages/Deposit'));
const Withdraw = lazy(() => import('./pages/Withdraw'));
const TransactionStatus = lazy(() => import('./pages/TransactionStatus'));
const Settings = lazy(() => import('./pages/Settings'));
const CompanyNews = lazy(() => import('./pages/CompanyNews'));
const TierList = lazy(() => import('./pages/TierList'));
const RankUpgrade = lazy(() => import('./pages/RankUpgrade'));
const Team = lazy(() => import('./pages/Team'));
const SpinWheel = lazy(() => import('./pages/SpinWheel'));
const AppRules = lazy(() => import('./pages/AppRules'));
const Courses = lazy(() => import('./pages/Courses'));

// Components
import NewsPopup from './components/NewsPopup';

// Layout
import MainLayout from './layout/MainLayout';

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-zinc-950">
    <img 
      src={logo} 
      alt="Loading" 
      className="w-72 h-72 object-contain animate-pulse"
    />
  </div>
);

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuthStore();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <img 
          src={logo} 
          alt="Loading" 
          className="w-72 h-72 object-contain animate-pulse"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { verifyToken, isAuthenticated, shouldShowNewsPopup, latestNews, setNewsQueue, hideNewsPopup, showNextNews, newsQueue, currentNewsIndex } = useAuthStore();
  const [frontendDisabled, setFrontendDisabled] = useState(false);
  const [systemSettingsLoading, setSystemSettingsLoading] = useState(true);

  useEffect(() => {
    verifyToken();
    checkSystemSettings();
  }, [verifyToken]);

  // Handle Telegram browser aggressive caching
  useEffect(() => {
    const isTelegram = /Telegram/i.test(navigator.userAgent);
    if (isTelegram) {
      const hasRefreshed = sessionStorage.getItem('telegram_refreshed');
      if (!hasRefreshed) {
        sessionStorage.setItem('telegram_refreshed', 'true');
        // Force reload from server to get fresh assets
        window.location.reload(true);
      }
    }
  }, []);

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
        // Backend now returns an array of news
        const newsArray = Array.isArray(response.data.news) ? response.data.news : [response.data.news];
        setNewsQueue(newsArray);
      }
    } catch (error) {
      console.error('Failed to fetch popup news:', error);
    }
  };

  const handleCloseNewsPopup = () => {
    hideNewsPopup();
  };

  const handleNextNews = () => {
    showNextNews();
  };

  const checkSystemSettings = async () => {
    try {
      const response = await systemAPI.getSettings();

      if (response.data.success) {
        setFrontendDisabled(response.data.settings?.frontendDisabled || false);
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
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <img 
          src={logo} 
          alt="Loading" 
          className="w-72 h-72 object-contain animate-pulse"
        />
      </div>
    );
  }

  return (
    <SettingsProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
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
          <NewsPopup 
            news={latestNews} 
            onClose={handleCloseNewsPopup}
            onNext={handleNextNews}
            currentIndex={currentNewsIndex}
            totalCount={newsQueue.length}
          />
        )}

        <Suspense fallback={<PageLoader />}>
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
              <Route path="transaction-status" element={<TransactionStatus />} />
              <Route path="settings" element={<Settings />} />
              <Route path="news" element={<CompanyNews />} />
              <Route path="tiers" element={<TierList />} />
              <Route path="rank-upgrade" element={<RankUpgrade />} />
              <Route path="team" element={<Team />} />
              <Route path="spin" element={<SpinWheel />} />
              <Route path="app-rules" element={<AppRules />} />
              <Route path="courses" element={<Courses />} />
            </Route>


            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;