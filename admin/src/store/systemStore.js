import { create } from 'zustand';
import { adminSystemAPI, adminReferralAPI, adminMembershipAPI } from '../services/api';

export const useSystemStore = create((set, get) => ({
    settings: null,
    categories: [],
    tiers: [],
    loading: false,
    error: null,

    fetchInitialData: async () => {
        set({ loading: true });
        try {
            const [settingsRes, membershipRes] = await Promise.all([
                adminReferralAPI.getSettings(),
                adminMembershipAPI.getAllTiers()
            ]);
            set({
                settings: settingsRes.data.settings,
                tiers: membershipRes.data.tiers,
                loading: false
            });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    updateSettings: async (newSettings) => {
        set({ loading: true });
        try {
            await adminReferralAPI.updateSettings(newSettings);
            set({ settings: newSettings, loading: false });
            return true;
        } catch (error) {
            set({ error: error.message, loading: false });
            return false;
        }
    },

    setCategories: (categories) => set({ categories }),
}));
