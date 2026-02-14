import { create } from 'zustand';
import { adminMembershipAPI } from '../services/api';

export const useAdminMembershipStore = create((set, get) => ({
    tiers: [],
    restrictedRange: null,
    loading: false,
    error: null,
    lastTiersFetch: 0, // Add caching timestamp

    // Helper to check if data is stale (defaults to 5 minutes)
    isStale: (lastFetchTime, duration = 5 * 60 * 1000) => {
        return Date.now() - lastFetchTime > duration;
    },

    fetchTiers: async (force = false) => {
        const { lastTiersFetch, loading, isStale, tiers } = get();

        // If not forcing, already loading, or data is fresh, skip fetch
        if (!force && (loading || !isStale(lastTiersFetch))) {
            return tiers;
        }

        set({ loading: true, error: null });
        try {
            const res = await adminMembershipAPI.getAllTiers();
            set({ 
                tiers: res.data.tiers, 
                lastTiersFetch: Date.now(),
                loading: false 
            });
            return { success: true, data: res.data.tiers };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch tiers';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    fetchRestrictedRange: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminMembershipAPI.getRestrictedRange();
            set({ restrictedRange: res.data.restrictedRange, loading: false });
            return { success: true, data: res.data.restrictedRange };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch restricted range';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    setRestrictedRange: async (data) => {
        set({ loading: true, error: null });
        try {
            await adminMembershipAPI.setRestrictedRange(data);
            await get().fetchRestrictedRange();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to set restricted range';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    clearRestrictedRange: async () => {
        set({ loading: true, error: null });
        try {
            await adminMembershipAPI.clearRestrictedRange();
            set({ restrictedRange: null, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to clear restricted range';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateTierPrice: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await adminMembershipAPI.updatePrice(id, data);
            await get().fetchTiers();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update tier price';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    toggleVisibility: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminMembershipAPI.toggleVisibility(id);
            await get().fetchTiers();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to toggle visibility';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
