import { create } from 'zustand';
import { systemAPI } from '../services/api';

export const useSystemStore = create((set, get) => ({
    settings: null,
    loading: false,
    error: null,
    lastFetch: 0,

    isStale: (lastFetchTime, duration = 5 * 60 * 1000) => {
        return Date.now() - lastFetchTime > duration;
    },

    fetchSettings: async (force = false) => {
        const { lastFetch, loading, isStale, settings } = get();

        if (!force && (loading || !isStale(lastFetch))) {
            return settings;
        }

        set({ loading: true, error: null });

        try {
            const response = await systemAPI.getSettings();
            const newSettings = response.data.settings;

            set({
                settings: newSettings,
                lastFetch: Date.now(),
                loading: false
            });
            return newSettings;
        } catch (error) {
            console.error('Failed to fetch system settings:', error);
            set({
                loading: false,
                error: 'Failed to fetch system settings'
            });
            return settings;
        }
    },

    reset: () => {
        set({
            settings: null,
            loading: false,
            error: null,
            lastFetch: 0
        });
    }
}));
