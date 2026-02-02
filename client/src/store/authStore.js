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
    newsQueue: [], // Array of all news to show
    currentNewsIndex: 0, // Track which news is currently being shown

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
            latestNews: null,
            newsQueue: [],
            currentNewsIndex: 0
        });
        // Force refresh on logout to clear session/cache
        const timestamp = new Date().getTime();
        window.location.href = `/login?v=${timestamp}`;
    },

    verifyToken: async () => {
        const token = localStorage.getItem('foxriver_token');
        
        if (!token) {
            set({ isAuthenticated: false, isInitializing: false });
            return false;
        }

        // Check 30-minute timeout (increased from 5 minutes)
        const lastActivity = localStorage.getItem('foxriver_last_activity');
        if (lastActivity) {
            const now = Date.now();
            const diff = now - parseInt(lastActivity);
            // Logout after 30 minutes of inactivity
            if (diff > 30 * 60 * 1000) {
                localStorage.removeItem('foxriver_token');
                localStorage.removeItem('foxriver_last_activity');
                set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
                return false;
            }
        }

        try {
            const response = await authAPI.verify();
            // Update last activity on successful verification
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

    setNewsQueue: (newsArray) => {
        if (newsArray && newsArray.length > 0) {
            set({ 
                newsQueue: newsArray, 
                currentNewsIndex: 0,
                latestNews: newsArray[0]
            });
        } else {
            set({ 
                newsQueue: [], 
                currentNewsIndex: 0,
                latestNews: null
            });
        }
    },

    showNextNews: () => {
        set((state) => {
            const nextIndex = state.currentNewsIndex + 1;
            if (nextIndex < state.newsQueue.length) {
                return {
                    currentNewsIndex: nextIndex,
                    latestNews: state.newsQueue[nextIndex]
                };
            } else {
                // No more news to show
                return {
                    shouldShowNewsPopup: false,
                    latestNews: null,
                    newsQueue: [],
                    currentNewsIndex: 0
                };
            }
        });
    },

    setLatestNews: (news) => {
        set({ latestNews: news });
    },

    hideNewsPopup: () => {
        set({ shouldShowNewsPopup: false, newsQueue: [], currentNewsIndex: 0, latestNews: null });
    },
}));
