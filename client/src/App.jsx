import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Task from './pages/Task';
import Wealth from './pages/Wealth';
import Mine from './pages/Mine';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import Mail from './pages/Mail';
import Settings from './pages/Settings';
import CompanyNews from './pages/CompanyNews';
import QnA from './pages/QnA';

// Layout
import MainLayout from './layout/MainLayout';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const { verifyToken } = useAuthStore();

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return (
    <BrowserRouter>
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
          <Route path="mine" element={<Mine />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="withdraw" element={<Withdraw />} />
          <Route path="mail" element={<Mail />} />
          <Route path="settings" element={<Settings />} />
          <Route path="news" element={<CompanyNews />} />
          <Route path="qna" element={<QnA />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;