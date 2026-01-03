import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('foxriver_token'),
    isAuthenticated: false,
    loading: false,
    error: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;

            localStorage.setItem('foxriver_token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            set({ loading: false, error: message });
            return { success: false, message };
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;

            localStorage.setItem('foxriver_token', token);
            set({ user, token, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            set({ loading: false, error: message });
            return { success: false, message };
        }
    },

    logout: () => {
        localStorage.removeItem('foxriver_token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    verifyToken: async () => {
        const token = localStorage.getItem('foxriver_token');
        if (!token) {
            set({ isAuthenticated: false });
            return false;
        }

        try {
            const response = await authAPI.verify();
            set({ user: response.data.user, isAuthenticated: true });
            return true;
        } catch (error) {
            localStorage.removeItem('foxriver_token');
            set({ user: null, token: null, isAuthenticated: false });
            return false;
        }
    },

    updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
    },
}));
