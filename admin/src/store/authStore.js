import { create } from 'zustand';
import { adminAuthAPI } from '../services/api';

export const useAdminAuthStore = create((set) => ({
    admin: null,
    token: localStorage.getItem('foxriver_admin_token'),
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

            localStorage.setItem('foxriver_admin_token', token);
            localStorage.setItem('foxriver_admin_last_active', Date.now().toString());

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
        localStorage.removeItem('foxriver_admin_token');
        localStorage.removeItem('foxriver_admin_last_active');
        set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
    },

    verifyToken: async () => {
        const token = localStorage.getItem('foxriver_admin_token');
        const lastActive = localStorage.getItem('foxriver_admin_last_active');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!token) {
            set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
            return;
        }

        // Check if session has expired (1 day inactivity)
        if (lastActive && (now - parseInt(lastActive)) > oneDay) {
            localStorage.removeItem('foxriver_admin_token');
            localStorage.removeItem('foxriver_admin_last_active');
            set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
            return;
        }

        try {
            // Update last active time
            localStorage.setItem('foxriver_admin_last_active', now.toString());

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
            localStorage.removeItem('foxriver_admin_token');
            localStorage.removeItem('foxriver_admin_last_active');
            set({ admin: null, token: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },
}));
