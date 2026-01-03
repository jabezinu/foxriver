import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import NewsManagement from './pages/News';
import QnaManagement from './pages/QnA';
import Messages from './pages/Messages';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAdminAuthStore();
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
          <Route path="news" element={<NewsManagement />} />
          <Route path="qna" element={<QnaManagement />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;