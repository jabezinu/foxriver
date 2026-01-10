import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('foxriver_token'),
    isAuthenticated: false,
    loading: false,
    isInitializing: true,
    error: null,
    shouldShowNewsPopup: false,
    latestNews: null,

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.login(credentials);
            const { token, user } = response.data;

            localStorage.setItem('foxriver_token', token);
            localStorage.setItem('foxriver_last_activity', Date.now().toString());
            set({ 
                user, 
                token, 
                isAuthenticated: true, 
                loading: false, 
                isInitializing: false,
                shouldShowNewsPopup: true // Trigger news popup on login
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            set({ loading: false, error: message, isInitializing: false });
            return { success: false, message };
        }
    },

    register: async (userData) => {
        set({ loading: true, error: null });
        try {
            const response = await authAPI.register(userData);
            const { token, user } = response.data;

            localStorage.setItem('foxriver_token', token);
            set({ 
                user, 
                token, 
                isAuthenticated: true, 
                loading: false,
                shouldShowNewsPopup: true // Trigger news popup on register
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            set({ loading: false, error: message });
            return { success: false, message };
        }
    },

    logout: () => {
        localStorage.removeItem('foxriver_token');
        localStorage.removeItem('foxriver_last_activity');
        set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isInitializing: false,
            shouldShowNewsPopup: false,
            latestNews: null
        });
    },

    verifyToken: async () => {
        const token = localStorage.getItem('foxriver_token');
        const lastActivity = localStorage.getItem('foxriver_last_activity');

        if (!token) {
            set({ isAuthenticated: false, isInitializing: false });
            return false;
        }

        // Check 5-minute timeout
        if (lastActivity) {
            const now = Date.now();
            const diff = now - parseInt(lastActivity);
            if (diff > 5 * 60 * 1000) {
                localStorage.removeItem('foxriver_token');
                localStorage.removeItem('foxriver_last_activity');
                set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
                return false;
            }
        }

        try {
            const response = await authAPI.verify();
            localStorage.setItem('foxriver_last_activity', Date.now().toString());
            set({ user: response.data.user, isAuthenticated: true, isInitializing: false });
            return true;
        } catch (error) {
            localStorage.removeItem('foxriver_token');
            localStorage.removeItem('foxriver_last_activity');
            set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
            return false;
        }
    },

    updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
    },

    setLatestNews: (news) => {
        set({ latestNews: news });
    },

    hideNewsPopup: () => {
        set({ shouldShowNewsPopup: false });
    },
}));
