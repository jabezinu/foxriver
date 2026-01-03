import { create } from 'zustand';
import { adminAuthAPI } from '../services/api';

export const useAdminAuthStore = create((set) => ({
    admin: null,
    token: localStorage.getItem('foxriver_admin_token'),
    isAuthenticated: false,
    loading: false,
    error: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await adminAuthAPI.login(credentials);
            const { token, user } = response.data;

            if (user.role !== 'admin') {
                throw new Error('Not authorized as admin');
            }

            localStorage.setItem('foxriver_admin_token', token);
            set({ admin: user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Admin login failed';
            set({ loading: false, error: message });
            return { success: false, message };
        }
    },

    logout: () => {
        localStorage.removeItem('foxriver_admin_token');
        set({ admin: null, token: null, isAuthenticated: false });
    },

    verifyToken: async () => {
        const token = localStorage.getItem('foxriver_admin_token');
        if (!token) return;

        try {
            const response = await adminAuthAPI.verify();
            if (response.data.user.role === 'admin') {
                set({ admin: response.data.user, isAuthenticated: true });
            } else {
                throw new Error('Not an admin');
            }
        } catch (error) {
            localStorage.removeItem('foxriver_admin_token');
            set({ admin: null, token: null, isAuthenticated: false });
        }
    },
}));
