import { create } from 'zustand';
import { adminSystemAPI, adminReferralAPI, adminMembershipAPI } from '../services/api';

export const useSystemStore = create((set, get) => ({
    settings: null,
    categories: [],
    loading: false,
    error: null,
    lastSettingsFetch: 0,

    fetchInitialData: async (force = false) => {
        const { lastSettingsFetch, settings } = get();
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        // Check if data is still fresh
        const settingsStale = (now - lastSettingsFetch) > CACHE_DURATION;
        
        if (!force && settings && !settingsStale) {
            return; // Use cached data
        }
        
        set({ loading: true });
        try {
            const response = await adminReferralAPI.getSettings();
            set({ 
                settings: response.data.settings,
                lastSettingsFetch: now,
                loading: false 
            });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    fetchSettings: async (force = false) => {
        const { lastSettingsFetch, loading, settings } = get();
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000;

        if (!force && settings && (now - lastSettingsFetch) < CACHE_DURATION) {
            return settings;
        }

        set({ loading: true, error: null });
        try {
            const response = await adminSystemAPI.getSettings();
            const newSettings = response.data.settings || response.data.data;
            set({ 
                settings: newSettings, 
                loading: false,
                lastSettingsFetch: now
            });
            return newSettings;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch settings';
            set({ error: message, loading: false });
            return null;
        }
    },

    updateSettings: async (newSettings) => {
        set({ loading: true, error: null });
        try {
            const response = await adminSystemAPI.updateSettings(newSettings);
            const updated = response.data.settings || response.data.data || newSettings;
            set({ 
                settings: updated, 
                loading: false,
                lastSettingsFetch: Date.now()
            });
            return { success: true, settings: updated };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update settings';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    processSalaries: async () => {
        set({ loading: true, error: null });
        try {
            const response = await adminSystemAPI.processSalaries();
            set({ loading: false });
            return { success: true, data: response.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to process salaries';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    setCategories: (categories) => set({ categories }),
    
    // Invalidate cache to force refresh
    invalidateCache: () => set({ lastSettingsFetch: 0 })
}));
