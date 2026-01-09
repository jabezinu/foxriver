import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('foxriver_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('foxriver_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    verify: () => api.get('/auth/verify'),
};

// User endpoints
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    getWallet: () => api.get('/users/wallet'),
    setBankAccount: (data) => api.put('/users/bank-account', data),
    setTransactionPassword: (data) => api.put('/users/transaction-password', data),
    changeLoginPassword: (data) => api.put('/users/login-password', data),
    getReferralLink: () => api.get('/users/referral-link'),
};

// Deposit endpoints
export const depositAPI = {
    create: (data) => api.post('/deposits/create', data),
    submitFT: (formData) => api.post('/deposits/submit-ft', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getUserDeposits: () => api.get('/deposits/user'),
};

// Withdrawal endpoints
export const withdrawalAPI = {
    create: (data) => api.post('/withdrawals/create', data),
    getUserWithdrawals: () => api.get('/withdrawals/user'),
};

// Task endpoints
export const taskAPI = {
    getDailyTasks: () => api.get('/tasks/daily'),
    completeTask: (taskId) => api.post(`/tasks/${taskId}/complete`),
};

// Video Task endpoints
export const videoTaskAPI = {
    getDailyVideoTasks: () => api.get('/video-tasks/daily'),
    updateVideoProgress: (videoAssignmentId, data) => api.post(`/video-tasks/${videoAssignmentId}/progress`, data),
    completeVideoTask: (videoAssignmentId, data) => api.post(`/video-tasks/${videoAssignmentId}/complete`, data),
    getVideoTaskStats: () => api.get('/video-tasks/stats'),
};

// Message endpoints
export const messageAPI = {
    getUserMessages: () => api.get('/messages/user'),
    markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
};

// Membership endpoints
export const membershipAPI = {
    getTiers: () => api.get('/memberships/tiers'),
    upgrade: (data) => api.post('/memberships/upgrade', data),
};

// Referral endpoints
export const referralAPI = {
    getDownline: () => api.get('/referrals/downline'),
    getCommissions: () => api.get('/referrals/commissions'),
    getSalary: () => api.get('/referrals/salary'),
};

// Q&A endpoints
export const qnaAPI = {
    getQnA: () => api.get('/qna'),
};

// News endpoints
export const newsAPI = {
    getNews: () => api.get('/news'),
};

export const bankAPI = {
    getBanks: () => api.get('/bank'),
};

// Spin endpoints
export const spinAPI = {
    spin: (data) => api.post('/spin', data),
    getHistory: () => api.get('/spin/history'),
    getBalance: () => api.get('/users/wallet'),
};

export default api;
