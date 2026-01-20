import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, lazy, Suspense } from 'react';
import { useAdminAuthStore } from './store/authStore';

// Layout
import AdminLayout from './layout/AdminLayout';

// Lazy load pages for better performance
const AdminLogin = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/Users'));
const DepositRequests = lazy(() => import('./pages/Deposits'));
const WithdrawalRequests = lazy(() => import('./pages/Withdrawals'));
const TaskManagement = lazy(() => import('./pages/Tasks'));
const QnaManagement = lazy(() => import('./pages/QnA'));
const Messages = lazy(() => import('./pages/Messages'));
const News = lazy(() => import('./pages/News'));
const BankSettings = lazy(() => import('./pages/BankSettings'));
const ReferralManagement = lazy(() => import('./pages/ReferralManagement'));
const SlotMachine = lazy(() => import('./pages/SlotMachine'));
const MembershipManagement = lazy(() => import('./pages/MembershipManagement'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const Courses = lazy(() => import('./pages/Courses'));
const WealthFunds = lazy(() => import('./pages/WealthFunds'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
);

function ProtectedRoute({ children }) {
  const { isAuthenticated, isCheckingAuth } = useAdminAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { verifyToken } = useAdminAuthStore();

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />

          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="deposits" element={<DepositRequests />} />
            <Route path="withdrawals" element={<WithdrawalRequests />} />
            <Route path="tasks" element={<TaskManagement />} />
            <Route path="qna" element={<QnaManagement />} />
            <Route path="messages" element={<Messages />} />
            <Route path="news" element={<News />} />
            <Route path="bank-settings" element={<BankSettings />} />
            <Route path="referral-management" element={<ReferralManagement />} />
            <Route path="slot-machine" element={<SlotMachine />} />
            <Route path="membership-management" element={<MembershipManagement />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="courses" element={<Courses />} />
            <Route path="wealth-funds" element={<WealthFunds />} />
            <Route path="admin-management" element={<AdminManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;