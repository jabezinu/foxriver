import { create } from 'zustand';
import { withdrawalAPI } from '../services/api';

export const useWithdrawalStore = create((set, get) => ({
    history: [],
    loading: false,
    submitting: false,
    error: null,

    fetchHistory: async () => {
        set({ loading: true, error: null });
        try {
            const response = await withdrawalAPI.getUserWithdrawals();
            const history = response.data.withdrawals || [];
            set({ history, loading: false });
            return history;
        } catch (error) {
            console.error('Failed to fetch withdrawal history:', error);
            const message = error.response?.data?.message || 'Failed to fetch history';
            set({ error: message, loading: false });
            return [];
        }
    },

    createWithdrawal: async (withdrawalData) => {
        set({ submitting: true, error: null });
        try {
            const response = await withdrawalAPI.create(withdrawalData);
            set({ submitting: false });
            // Invalidate/Refresh history after success
            get().fetchHistory();
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Failed to create withdrawal:', error);
            const message = error.response?.data?.message || 'Withdrawal failed';
            set({ error: message, submitting: false });
            return { success: false, message };
        }
    },

    reset: () => {
        set({
            history: [],
            loading: false,
            submitting: false,
            error: null
        });
    }
}));
