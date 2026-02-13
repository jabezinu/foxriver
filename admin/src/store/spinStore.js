import { create } from 'zustand';
import { adminSpinAPI } from '../services/api';

export const useAdminSpinStore = create((set, get) => ({
    spins: [],
    stats: null,
    pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    loading: false,
    error: null,

    fetchSpinResults: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await adminSpinAPI.getAllSpins(params);
            set({
                spins: response.data.data.spins,
                stats: response.data.data.stats,
                pagination: {
                    page: params.page || 1,
                    limit: params.limit || 50,
                    total: response.data.data.pagination.total,
                    pages: response.data.data.pagination.pages
                },
                loading: false
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Gaming Matrix Signal Lost';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
