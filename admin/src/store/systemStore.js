import { create } from 'zustand';
import { adminSystemAPI, adminReferralAPI, adminMembershipAPI } from '../services/api';

export const useSystemStore = create((set, get) => ({
    settings: null,
    categories: [],
    tiers: [],
    loading: false,
    error: null,
    lastSettingsFetch: 0,
    lastTiersFetch: 0,

    fetchInitialData: async (force = false) => {
        const { lastSettingsFetch, lastTiersFetch, settings, tiers } = get();
        const now = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        // Check if data is still fresh
        const settingsStale = (now - lastSettingsFetch) > CACHE_DURATION;
        const tiersStale = (now - lastTiersFetch) > CACHE_DURATION;
        
        if (!force && settings && tiers && !settingsStale && !tiersStale) {
            return; // Use cached data
        }
        
        set({ loading: true });
        try {
            const promises = [];
            
            if (force || !settings || settingsStale) {
                promises.push(adminReferralAPI.getSettings());
            }
            if (force || !tiers || tiersStale) {
                promises.push(adminMembershipAPI.getAllTiers());
            }
            
            const results = await Promise.all(promises);
            
            const updates = { loading: false };
            let resultIndex = 0;
            
            if (force || !settings || settingsStale) {
                updates.settings = results[resultIndex].data.settings;
                updates.lastSettingsFetch = now;
                resultIndex++;
            }
            if (force || !tiers || tiersStale) {
                updates.tiers = results[resultIndex].data.tiers;
                updates.lastTiersFetch = now;
            }
            
            set(updates);
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
    invalidateCache: () => set({ lastSettingsFetch: 0, lastTiersFetch: 0 })
}));
