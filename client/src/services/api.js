import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Configure axios defaults
axios.defaults.baseURL = API_CONFIG.baseURL;
axios.defaults.timeout = API_CONFIG.timeout;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Cache-Control'] = 'no-cache';
axios.defaults.headers.common['Pragma'] = 'no-cache';

// Request interceptor to add token
axios.interceptors.request.use(
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
axios.interceptors.response.use(
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
    register: (data) => axios.post('/auth/register', data),
    login: (data) => axios.post('/auth/login', data),
    verify: () => axios.get('/auth/verify'),
};

// User endpoints
export const userAPI = {
    getProfile: () => axios.get('/users/profile'),
    updateProfile: (data) => axios.put('/users/profile', data),
    uploadProfilePhoto: (formData) => axios.post('/users/profile-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    deleteProfilePhoto: () => axios.delete('/users/profile-photo'),
    getWallet: () => axios.get('/users/wallet'),
    setBankAccount: (data) => axios.put('/users/bank-account', data),
    setTransactionPassword: (data) => axios.put('/users/transaction-password', data),
    changeLoginPassword: (data) => axios.put('/users/login-password', data),
    getReferralLink: () => axios.get('/users/referral-link'),
    getSystemSettings: () => axios.get('/system/settings'),
};

// Deposit endpoints
export const depositAPI = {
    create: (data) => axios.post('/deposits/create', data),
    submitFT: (formData) => axios.post('/deposits/submit-ft', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }),
    getUserDeposits: () => axios.get('/deposits/user'),
};

// Withdrawal endpoints
export const withdrawalAPI = {
    create: (data) => axios.post('/withdrawals/create', data),
    getUserWithdrawals: () => axios.get('/withdrawals/user'),
};

// Task endpoints
export const taskAPI = {
    getDailyTasks: () => axios.get('/tasks/daily'),
    completeTask: (taskId) => axios.post(`/tasks/${taskId}/complete`),
};

// Video Task endpoints
export const videoTaskAPI = {
    getDailyVideoTasks: () => axios.get('/video-tasks/daily'),
    updateVideoProgress: (videoAssignmentId, data) => axios.post(`/video-tasks/${videoAssignmentId}/progress`, data),
    completeVideoTask: (videoAssignmentId, data) => axios.post(`/video-tasks/${videoAssignmentId}/complete`, data),
    getVideoTaskStats: () => axios.get('/video-tasks/stats'),
};

// Message endpoints
export const messageAPI = {
    getUserMessages: () => axios.get('/messages/user'),
    markAsRead: (messageId) => axios.put(`/messages/${messageId}/read`),
};

// Membership endpoints
export const membershipAPI = {
    getTiers: () => axios.get('/memberships/tiers'),
    upgrade: (data) => axios.post('/memberships/upgrade', data),
};

// Referral endpoints
export const referralAPI = {
    getDownline: () => axios.get('/referrals/downline'),
    getCommissions: () => axios.get('/referrals/commissions'),
    getSalary: () => axios.get('/referrals/salary'),
};

// Q&A endpoints
export const qnaAPI = {
    getQnA: () => axios.get('/qna'),
};

// News endpoints
export const newsAPI = {
    getNews: () => axios.get('/news'),
    getPopupNews: () => axios.get('/news/popup'),
};

// Chat endpoints
export const chatAPI = {
    getChat: () => axios.get('/chat'),
    getMessages: (chatId) => axios.get(`/chat/${chatId}/messages`),
    sendMessage: (chatId, content) => axios.post(`/chat/${chatId}/messages`, { content }),
};

export const bankAPI = {
    getBanks: () => axios.get('/bank'),
};

// Spin endpoints
export const spinAPI = {
    spin: (data) => axios.post('/spin', data),
    getHistory: () => axios.get('/spin/history'),
    getBalance: () => axios.get('/users/wallet'),
};

// Courses endpoints
export const coursesAPI = {
    getCategories: () => axios.get('/courses/categories'),
    getCoursesByCategory: (categoryId) => axios.get(`/courses/category/${categoryId}`),
};

// Slot Tier endpoints
export const slotTierAPI = {
    getTiers: () => axios.get('/slot-tiers'),
};

// Wealth endpoints
export const wealthAPI = {
    getFunds: () => axios.get('/wealth/funds'),
    getFundById: (id) => axios.get(`/wealth/funds/${id}`),
    invest: (data) => axios.post('/wealth/invest', data),
    getMyInvestments: () => axios.get('/wealth/my-investments'),
};

// System endpoints
export const systemAPI = {
    getSettings: () => axios.get('/system/settings'),
};

export default axios;
