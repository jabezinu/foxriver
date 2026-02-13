import { create } from 'zustand';
import { adminDepositAPI } from '../services/api';

export const useAdminDepositStore = create((set, get) => ({
    deposits: [],
    loading: false,
    error: null,

    fetchDeposits: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await adminDepositAPI.getDeposits(params);
            set({ deposits: res.data.deposits, loading: false });
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch deposits';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    approveDeposit: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminDepositAPI.approve(id, data);
            await get().fetchDeposits(); // Refresh list
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to approve deposit';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    rejectDeposit: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminDepositAPI.reject(id, data);
            await get().fetchDeposits(); // Refresh list
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reject deposit';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    undoDeposit: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await adminDepositAPI.undo(id);
            await get().fetchDeposits(); // Refresh list
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to undo deposit';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
