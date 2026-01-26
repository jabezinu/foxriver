import axios from 'axios';
import API_CONFIG from '../config/api.config';
import { STORAGE_KEYS, API_ENDPOINTS } from '../config/constants';

// Configure axios defaults
axios.defaults.baseURL = API_CONFIG.baseURL;
axios.defaults.timeout = API_CONFIG.timeout;
axios.defaults.headers.common['Content-Type'] = 'application/json';

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
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
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);


export const adminAuthAPI = {
    login: (data) => axios.post(API_ENDPOINTS.AUTH.LOGIN, data),
    verify: () => axios.get(API_ENDPOINTS.AUTH.VERIFY),
};

export const adminStatsAPI = {
    getStats: () => axios.get(API_ENDPOINTS.ADMIN.STATS),
};

export const adminUserAPI = {
    getAllUsers: (params) => axios.get(API_ENDPOINTS.ADMIN.USERS, { params }),
    getUserDetails: (id) => axios.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}`),
    getUserReferenceTree: (id) => axios.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}/reference-tree`),
    updateUser: (id, data) => axios.put(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, data),
    deleteUser: (id) => axios.delete(`${API_ENDPOINTS.ADMIN.USERS}/${id}`),
    getUserDeposits: (id) => axios.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}/deposits`),
    getUserWithdrawals: (id) => axios.get(`${API_ENDPOINTS.ADMIN.USERS}/${id}/withdrawals`),
    restrictAllUsers: (data) => axios.put(`${API_ENDPOINTS.ADMIN.USERS}/restrict-all`, data),
    getCurrentRestrictions: () => axios.get(`${API_ENDPOINTS.ADMIN.USERS}/restrictions`),
};

export const adminDepositAPI = {
    getDeposits: (params) => axios.get(`${API_ENDPOINTS.DEPOSITS}/all`, { params }),
    approve: (id, data) => axios.put(`${API_ENDPOINTS.DEPOSITS}/${id}/approve`, data),
    reject: (id, data) => axios.put(`${API_ENDPOINTS.DEPOSITS}/${id}/reject`, data),
    undo: (id) => axios.put(`${API_ENDPOINTS.DEPOSITS}/${id}/undo`),
};

export const adminWithdrawalAPI = {
    getWithdrawals: (params) => axios.get(`${API_ENDPOINTS.WITHDRAWALS}/all`, { params }),
    approve: (id, data) => axios.put(`${API_ENDPOINTS.WITHDRAWALS}/${id}/approve`, data),
    reject: (id, data) => axios.put(`${API_ENDPOINTS.WITHDRAWALS}/${id}/reject`, data),
    undo: (id) => axios.put(`${API_ENDPOINTS.WITHDRAWALS}/${id}/undo`),
};


export const adminTaskAPI = {
    getTasks: () => axios.get(`${API_ENDPOINTS.TASKS}/all`), // Effectively gets pool now
    getPool: () => axios.get(`${API_ENDPOINTS.TASKS}/pool`), // Explicit pool fetch
    upload: (data) => axios.post(`${API_ENDPOINTS.TASKS}/upload`, data),
    delete: (id) => axios.delete(`${API_ENDPOINTS.TASKS}/${id}`),
    getPlaylists: () => axios.get(`${API_ENDPOINTS.TASKS}/playlists`),
    addPlaylist: (data) => axios.post(`${API_ENDPOINTS.TASKS}/playlists`, data),
    deletePlaylist: (id) => axios.delete(`${API_ENDPOINTS.TASKS}/playlists/${id}`),
    syncVideos: () => axios.post(`${API_ENDPOINTS.TASKS}/playlists/sync`),
};

export const adminMessageAPI = {
    // Removed - message feature deleted
};

export const adminNewsAPI = {
    getAll: () => axios.get(API_ENDPOINTS.NEWS),
    create: (data) => axios.post(API_ENDPOINTS.NEWS, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => axios.put(`${API_ENDPOINTS.NEWS}/${id}`, data),
    delete: (id) => axios.delete(`${API_ENDPOINTS.NEWS}/${id}`),
};

export const adminChatAPI = {
    getAllChats: () => axios.get(`${API_ENDPOINTS.CHAT}/admin`),
    getMessages: (chatId) => axios.get(`${API_ENDPOINTS.CHAT}/${chatId}/messages`),
    sendMessage: (chatId, content) => axios.post(`${API_ENDPOINTS.CHAT}/${chatId}/messages`, { content }),
};

export const adminQnaAPI = {
    getQna: () => axios.get(API_ENDPOINTS.QNA),
    upload: (data) => axios.post(`${API_ENDPOINTS.QNA}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => axios.delete(`${API_ENDPOINTS.QNA}/${id}`),
};

export const adminProfileAPI = {
    updateProfile: (data) => axios.put(API_ENDPOINTS.ADMIN.PROFILE, data),
};

export const adminBankAPI = {
    getAll: () => axios.get(`${API_ENDPOINTS.BANK}/admin`),
    create: (data) => axios.post(API_ENDPOINTS.BANK, data),
    update: (id, data) => axios.put(`${API_ENDPOINTS.BANK}/${id}`, data),
    delete: (id) => axios.delete(`${API_ENDPOINTS.BANK}/${id}`),
};


export const adminSystemAPI = {
    getSettings: () => axios.get(API_ENDPOINTS.ADMIN.SETTINGS),
    updateSettings: (data) => axios.put(API_ENDPOINTS.ADMIN.SETTINGS, data),
    getCommissions: () => axios.get(API_ENDPOINTS.ADMIN.COMMISSIONS),
    processSalaries: () => axios.post(API_ENDPOINTS.ADMIN.SALARIES),
};

export const adminSpinAPI = {
    getAllSpins: (params) => axios.get(`${API_ENDPOINTS.SPIN}/admin/all`, { params }),
};

export const adminMembershipAPI = {
    getAllTiers: () => axios.get(`${API_ENDPOINTS.MEMBERSHIPS}/admin/all`),
    hideRange: (data) => axios.put(`${API_ENDPOINTS.MEMBERSHIPS}/admin/hide-range`, data),
    unhideRange: (data) => axios.put(`${API_ENDPOINTS.MEMBERSHIPS}/admin/unhide-range`, data),
    toggleVisibility: (id) => axios.put(`${API_ENDPOINTS.MEMBERSHIPS}/admin/toggle-visibility/${id}`),
    setRestrictedRange: (data) => axios.put(`${API_ENDPOINTS.MEMBERSHIPS}/admin/set-restricted-range`, data),
    getRestrictedRange: () => axios.get(`${API_ENDPOINTS.MEMBERSHIPS}/admin/restricted-range`),
    clearRestrictedRange: () => axios.delete(`${API_ENDPOINTS.MEMBERSHIPS}/admin/restricted-range`),
    updatePrice: (id, data) => axios.put(`${API_ENDPOINTS.MEMBERSHIPS}/admin/update-price/${id}`, data),
    bulkUpdatePrices: (data) => axios.put(`${API_ENDPOINTS.MEMBERSHIPS}/admin/bulk-update-prices`, data),
};

export const adminManagementAPI = {
    getAdmins: () => axios.get(API_ENDPOINTS.ADMIN.ADMINS),
    createAdmin: (data) => axios.post(API_ENDPOINTS.ADMIN.ADMINS, data),
    updatePermissions: (id, data) => axios.put(`${API_ENDPOINTS.ADMIN.ADMINS}/${id}/permissions`, data),
    deleteAdmin: (id) => axios.delete(`${API_ENDPOINTS.ADMIN.ADMINS}/${id}`),
};

export const adminReferralAPI = {
    getCommissions: () => axios.get(API_ENDPOINTS.ADMIN.COMMISSIONS),
    getSettings: () => axios.get(API_ENDPOINTS.ADMIN.SETTINGS),
    updateSettings: (data) => axios.put(API_ENDPOINTS.ADMIN.SETTINGS, data),
};

export const adminCoursesAPI = {
    getCategories: () => axios.get(`${API_ENDPOINTS.COURSES}/admin/categories`),
    createCategory: (data) => axios.post(`${API_ENDPOINTS.COURSES}/admin/categories`, data),
    updateCategory: (id, data) => axios.put(`${API_ENDPOINTS.COURSES}/admin/categories/${id}`, data),
    deleteCategory: (id) => axios.delete(`${API_ENDPOINTS.COURSES}/admin/categories/${id}`),
    getCourses: () => axios.get(`${API_ENDPOINTS.COURSES}/admin/courses`),
    createCourse: (data) => axios.post(`${API_ENDPOINTS.COURSES}/admin/courses`, data),
    updateCourse: (id, data) => axios.put(`${API_ENDPOINTS.COURSES}/admin/courses/${id}`, data),
    deleteCourse: (id) => axios.delete(`${API_ENDPOINTS.COURSES}/admin/courses/${id}`),
};

export const adminWealthAPI = {
    getAllFunds: () => axios.get(`${API_ENDPOINTS.WEALTH}/admin/funds`),
    createFund: (data) => axios.post(`${API_ENDPOINTS.WEALTH}/admin/funds`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateFund: (id, data) => axios.put(`${API_ENDPOINTS.WEALTH}/admin/funds/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteFund: (id) => axios.delete(`${API_ENDPOINTS.WEALTH}/admin/funds/${id}`),
    getAllInvestments: () => axios.get(`${API_ENDPOINTS.WEALTH}/admin/investments`),
};

export const adminSlotTierAPI = {
    getAll: () => axios.get(`${API_ENDPOINTS.SLOT_TIERS}/admin/all`),
    create: (data) => axios.post(`${API_ENDPOINTS.SLOT_TIERS}/admin`, data),
    update: (id, data) => axios.put(`${API_ENDPOINTS.SLOT_TIERS}/admin/${id}`, data),
    delete: (id) => axios.delete(`${API_ENDPOINTS.SLOT_TIERS}/admin/${id}`),
    toggle: (id) => axios.patch(`${API_ENDPOINTS.SLOT_TIERS}/admin/${id}/toggle`),
};

export default axios;

