import { create } from 'zustand';
import { adminSlotTierAPI } from '../services/api';

export const useAdminSlotTierStore = create((set, get) => ({
    tiers: [],
    loading: false,
    error: null,

    fetchTiers: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminSlotTierAPI.getAll();
            set({ tiers: res.data.tiers, loading: false });
            return { success: true, data: res.data.tiers };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch slot tiers';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    createTier: async (data) => {
        set({ loading: true, error: null });
        try {
            await adminSlotTierAPI.create(data);
            await get().fetchTiers();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create slot tier';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateTier: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await adminSlotTierAPI.update(id, data);
            await get().fetchTiers();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update slot tier';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteTier: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminSlotTierAPI.delete(id);
            await get().fetchTiers();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete slot tier';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    toggleTier: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminSlotTierAPI.toggle(id);
            await get().fetchTiers();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to toggle slot tier';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
