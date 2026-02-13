import { create } from 'zustand';
import { adminBankAPI } from '../services/api';

export const useAdminBankStore = create((set, get) => ({
    banks: [],
    loading: false,
    error: null,

    fetchBanks: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminBankAPI.getAll();
            set({ banks: res.data.banks, loading: false });
            return { success: true, data: res.data.banks };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch banks';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    createBank: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminBankAPI.create(data);
            await get().fetchBanks();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create bank';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateBank: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminBankAPI.update(id, data);
            await get().fetchBanks();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update bank';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteBank: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await adminBankAPI.delete(id);
            await get().fetchBanks();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete bank';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
