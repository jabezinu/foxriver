import { create } from 'zustand';
import { adminWithdrawalAPI } from '../services/api';

export const useAdminWithdrawalStore = create((set, get) => ({
    withdrawals: [],
    loading: false,
    error: null,

    fetchWithdrawals: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await adminWithdrawalAPI.getWithdrawals(params);
            set({ withdrawals: res.data.withdrawals, loading: false });
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch withdrawals';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    approveWithdrawal: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminWithdrawalAPI.approve(id, data);
            await get().fetchWithdrawals();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to approve withdrawal';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    rejectWithdrawal: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminWithdrawalAPI.reject(id, data);
            await get().fetchWithdrawals();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to reject withdrawal';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    undoWithdrawal: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await adminWithdrawalAPI.undo(id);
            await get().fetchWithdrawals();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to undo withdrawal';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
