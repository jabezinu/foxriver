import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAdminAuthStore } from './store/authStore';

// Layout
import AdminLayout from './layout/AdminLayout';

// Pages
import AdminLogin from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/Users';
import DepositRequests from './pages/Deposits';
import WithdrawalRequests from './pages/Withdrawals';
import TaskManagement from './pages/Tasks';
import QnaManagement from './pages/QnA';
import Messages from './pages/Messages';
import News from './pages/News';
import BankSettings from './pages/BankSettings';
import ReferralManagement from './pages/ReferralManagement';
import SlotMachine from './pages/SlotMachine';
import MembershipManagement from './pages/MembershipManagement';
import SystemSettings from './pages/SystemSettings';

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
    <BrowserRouter>
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
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;