import { create } from 'zustand';
import { adminAuthAPI } from '../services/api';
import { STORAGE_KEYS } from '../config/constants';

export const useAdminAuthStore = create((set) => ({
    admin: null,
    token: localStorage.getItem(STORAGE_KEYS.TOKEN),
    isAuthenticated: false,
    isCheckingAuth: true,
    loading: false,
    error: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAuthAPI.login(credentials);
            const { token, user } = response.data;

            if (user.role !== 'admin' && user.role !== 'superadmin') {
                throw new Error('Not authorized as admin');
            }

            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());

            set({
                admin: user,
                token,
                isAuthenticated: true,
                loading: false,
                isCheckingAuth: false
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Admin login failed';
            set({ loading: false, error: message, isCheckingAuth: false });
            return { success: false, message };
        }
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE);
        set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
        // Force refresh on logout to clear session/cache
        const timestamp = new Date().getTime();
        window.location.href = `/login?v=${timestamp}`;
    },

    verifyToken: async () => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const lastActive = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!token) {
            set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
            return;
        }

        // Check if session has expired (1 day inactivity)
        if (lastActive && (now - parseInt(lastActive)) > oneDay) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE);
            set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
            return;
        }

        try {
            // Update last active time
            localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, now.toString());

            const response = await adminAuthAPI.verify();
            if (response.data.user.role === 'admin' || response.data.user.role === 'superadmin') {
                set({
                    admin: response.data.user,
                    isAuthenticated: true,
                    isCheckingAuth: false
                });
            } else {
                throw new Error('Not an admin');
            }
        } catch (error) {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE);
            set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },

    updateProfile: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminAuthAPI.updateProfile ? await adminAuthAPI.updateProfile(data) : await axios.put(API_ENDPOINTS.ADMIN.PROFILE, data);
            // If phone or password changed, user might need to relogin but store can just update admin data
            if (res.data.user) {
                set({ admin: res.data.user });
            }
            set({ loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Profile Update Rejection';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },
}));

