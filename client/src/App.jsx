import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState, lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';
import { useNewsStore } from './store/newsStore';
import { useSystemStore } from './store/systemStore';
import { WalletProvider } from './contexts/WalletContext';
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

import PageLoader from './components/PageLoader';

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
  const { fetchPopupNews } = useNewsStore();
  const { settings, fetchSettings, loading: settingsLoading } = useSystemStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        verifyToken(),
        fetchSettings()
      ]);
      setIsReady(true);
    };
    init();
  }, [verifyToken, fetchSettings]);

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

  // Fetch latest popup news when user logs in or on refresh
  useEffect(() => {
    if (isAuthenticated) {
      fetchLatestPopupNews();
    }
  }, [isAuthenticated]);

  const fetchLatestPopupNews = async () => {
    const news = await fetchPopupNews();
    if (news && news.length > 0) {
      setNewsQueue(news);
    }
  };

  const handleCloseNewsPopup = () => {
    hideNewsPopup();
  };

  const handleNextNews = () => {
    showNextNews();
  };


  // Show white page if frontend is disabled
  if (isReady && settings?.frontendDisabled) {
    return (
      <div className="min-h-screen bg-white">
        {/* Completely white page - no content */}
      </div>
    );
  }

  // Show loading spinner while checking system settings
  if (!isReady) {
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
    <WalletProvider>
        <BrowserRouter
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: false,
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
    </WalletProvider>
  );
}

export default App;