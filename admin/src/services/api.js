import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.3.53:5001/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('foxriver_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
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
    login: (data) => api.post('/auth/login', data),
    verify: () => api.get('/auth/verify'),
};

export const adminStatsAPI = {
    getStats: () => api.get('/admin/stats'),
};

export const adminUserAPI = {
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getUserDetails: (id) => api.get(`/admin/users/${id}`),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getUserDeposits: (id) => api.get(`/admin/users/${id}/deposits`),
    getUserWithdrawals: (id) => api.get(`/admin/users/${id}/withdrawals`),
    restrictAllUsers: (data) => api.put('/admin/users/restrict-all', data),
};

export const adminDepositAPI = {
    getDeposits: (params) => api.get('/deposits/all', { params }),
    approve: (id, data) => api.put(`/deposits/${id}/approve`, data),
    reject: (id, data) => api.put(`/deposits/${id}/reject`, data),
};

export const adminWithdrawalAPI = {
    getWithdrawals: (params) => api.get('/withdrawals/all', { params }),
    approve: (id, data) => api.put(`/withdrawals/${id}/approve`, data),
    reject: (id, data) => api.put(`/withdrawals/${id}/reject`, data),
};

export const adminTaskAPI = {
    getTasks: () => api.get('/tasks/all'),
    upload: (data) => api.post('/tasks/upload', data),
    delete: (id) => api.delete(`/tasks/${id}`),
    // Playlist management
    getPlaylists: () => api.get('/tasks/playlists'),
    addPlaylist: (data) => api.post('/tasks/playlists', data),
    deletePlaylist: (id) => api.delete(`/tasks/playlists/${id}`),
    syncVideos: () => api.post('/tasks/playlists/sync'),
};

export const adminMessageAPI = {
    getAll: () => api.get('/messages/all'),
    send: (data) => api.post('/messages/send', data),
    update: (id, data) => api.put(`/messages/${id}`, data),
    delete: (id) => api.delete(`/messages/${id}`),
};

export const adminNewsAPI = {
    getNews: () => api.get('/news'),
    create: (data) => api.post('/news', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/news/${id}`, data),
    delete: (id) => api.delete(`/news/${id}`),
};

export const adminQnaAPI = {
    getQna: () => api.get('/qna'),
    upload: (data) => api.post('/qna/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/qna/${id}`),
};

export const adminProfileAPI = {
    updateProfile: (data) => api.put('/admin/profile', data),
};

export const adminBankAPI = {
    getAll: () => api.get('/bank/admin'),
    create: (data) => api.post('/bank', data),
    update: (id, data) => api.put(`/bank/${id}`, data),
    delete: (id) => api.delete(`/bank/${id}`),
};

export default api;
