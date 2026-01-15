import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Configure axios defaults
axios.defaults.baseURL = API_CONFIG.baseURL;
axios.defaults.timeout = API_CONFIG.timeout;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Cache-Control'] = 'no-cache';
axios.defaults.headers.common['Pragma'] = 'no-cache';

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('foxriver_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('foxriver_admin_token');
            localStorage.removeItem('foxriver_admin_last_active');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const adminAuthAPI = {
    login: (data) => axios.post('/auth/login', data),
    verify: () => axios.get('/auth/verify'),
};

export const adminStatsAPI = {
    getStats: () => axios.get('/admin/stats'),
};

export const adminUserAPI = {
    getAllUsers: (params) => axios.get('/admin/users', { params }),
    getUserDetails: (id) => axios.get(`/admin/users/${id}`),
    updateUser: (id, data) => axios.put(`/admin/users/${id}`, data),
    deleteUser: (id) => axios.delete(`/admin/users/${id}`),
    getUserDeposits: (id) => axios.get(`/admin/users/${id}/deposits`),
    getUserWithdrawals: (id) => axios.get(`/admin/users/${id}/withdrawals`),
    restrictAllUsers: (data) => axios.put('/admin/users/restrict-all', data),
};

export const adminDepositAPI = {
    getDeposits: (params) => axios.get('/deposits/all', { params }),
    approve: (id, data) => axios.put(`/deposits/${id}/approve`, data),
    reject: (id, data) => axios.put(`/deposits/${id}/reject`, data),
};

export const adminWithdrawalAPI = {
    getWithdrawals: (params) => axios.get('/withdrawals/all', { params }),
    approve: (id, data) => axios.put(`/withdrawals/${id}/approve`, data),
    reject: (id, data) => axios.put(`/withdrawals/${id}/reject`, data),
};

export const adminTaskAPI = {
    getTasks: () => axios.get('/tasks/all'),
    upload: (data) => axios.post('/tasks/upload', data),
    delete: (id) => axios.delete(`/tasks/${id}`),
    // Playlist management
    getPlaylists: () => axios.get('/tasks/playlists'),
    addPlaylist: (data) => axios.post('/tasks/playlists', data),
    deletePlaylist: (id) => axios.delete(`/tasks/playlists/${id}`),
    syncVideos: () => axios.post('/tasks/playlists/sync'),
};

export const adminMessageAPI = {
    getAll: () => axios.get('/messages/all'),
    send: (data) => axios.post('/messages/send', data),
    update: (id, data) => axios.put(`/messages/${id}`, data),
    delete: (id) => axios.delete(`/messages/${id}`),
};

export const adminNewsAPI = {
    getAll: () => axios.get('/news'),
    create: (data) => axios.post('/news', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => axios.put(`/news/${id}`, data),
    delete: (id) => axios.delete(`/news/${id}`),
};

export const adminChatAPI = {
    getAllChats: () => axios.get('/chat/admin'),
    getMessages: (chatId) => axios.get(`/chat/${chatId}/messages`),
    sendMessage: (chatId, content) => axios.post(`/chat/${chatId}/messages`, { content }),
};

export const adminQnaAPI = {
    getQna: () => axios.get('/qna'),
    upload: (data) => axios.post('/qna/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => axios.delete(`/qna/${id}`),
};

export const adminProfileAPI = {
    updateProfile: (data) => axios.put('/admin/profile', data),
};

export const adminBankAPI = {
    getAll: () => axios.get('/bank/admin'),
    create: (data) => axios.post('/bank', data),
    update: (id, data) => axios.put(`/bank/${id}`, data),
    delete: (id) => axios.delete(`/bank/${id}`),
};

export const adminReferralAPI = {
    getSettings: () => axios.get('/admin/settings'),
    updateSettings: (data) => axios.put('/admin/settings', data),
    getCommissions: () => axios.get('/admin/commissions'),
};

export const adminSpinAPI = {
    getAllSpins: (params) => axios.get('/spin/admin/all', { params }),
};

export const adminMembershipAPI = {
    getAllTiers: () => axios.get('/memberships/admin/all'),
    hideRange: (data) => axios.put('/memberships/admin/hide-range', data),
    unhideRange: (data) => axios.put('/memberships/admin/unhide-range', data),
    setRestrictedRange: (data) => axios.put('/memberships/admin/set-restricted-range', data),
    getRestrictedRange: () => axios.get('/memberships/admin/restricted-range'),
    clearRestrictedRange: () => axios.delete('/memberships/admin/restricted-range'),
    updatePrice: (id, data) => axios.put(`/memberships/admin/update-price/${id}`, data),
    bulkUpdatePrices: (data) => axios.put('/memberships/admin/bulk-update-prices', data),
};

export const adminManagementAPI = {
    getAdmins: () => axios.get('/admin/admins'),
    createAdmin: (data) => axios.post('/admin/admins', data),
    updatePermissions: (id, data) => axios.put(`/admin/admins/${id}/permissions`, data),
    deleteAdmin: (id) => axios.delete(`/admin/admins/${id}`),
};

export const adminCoursesAPI = {
    getCategories: () => axios.get('/courses/admin/categories'),
    createCategory: (data) => axios.post('/courses/admin/categories', data),
    updateCategory: (id, data) => axios.put(`/courses/admin/categories/${id}`, data),
    deleteCategory: (id) => axios.delete(`/courses/admin/categories/${id}`),
    getCourses: () => axios.get('/courses/admin/courses'),
    createCourse: (data) => axios.post('/courses/admin/courses', data),
    updateCourse: (id, data) => axios.put(`/courses/admin/courses/${id}`, data),
    deleteCourse: (id) => axios.delete(`/courses/admin/courses/${id}`),
};

export const adminWealthAPI = {
    getAllFunds: () => axios.get('/wealth/admin/funds'),
    createFund: (data) => axios.post('/wealth/admin/funds', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateFund: (id, data) => axios.put(`/wealth/admin/funds/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteFund: (id) => axios.delete(`/wealth/admin/funds/${id}`),
    getAllInvestments: () => axios.get('/wealth/admin/investments'),
};

export const adminSystemAPI = {
    getSettings: () => axios.get('/admin/settings'),
    updateSettings: (data) => axios.put('/admin/settings', data),
    processSalaries: () => axios.post('/admin/salaries/process'),
};

export const adminSlotTierAPI = {
    getAll: () => axios.get('/slot-tiers/admin/all'),
    create: (data) => axios.post('/slot-tiers/admin', data),
    update: (id, data) => axios.put(`/slot-tiers/admin/${id}`, data),
    delete: (id) => axios.delete(`/slot-tiers/admin/${id}`),
    toggle: (id) => axios.patch(`/slot-tiers/admin/${id}/toggle`),
};

export default axios;
