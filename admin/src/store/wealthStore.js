import { create } from 'zustand';
import { adminWealthAPI } from '../services/api';

export const useAdminWealthStore = create((set, get) => ({
    funds: [],
    investments: [],
    loading: false,
    error: null,

    fetchFunds: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminWealthAPI.getAllFunds();
            set({ funds: res.data.funds, loading: false });
            return { success: true, data: res.data.funds };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch wealth funds';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    fetchInvestments: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminWealthAPI.getAllInvestments();
            set({ investments: res.data.investments, loading: false });
            return { success: true, data: res.data.investments };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch investments';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    createFund: async (formData) => {
        set({ loading: true, error: null });
        try {
            const res = await adminWealthAPI.createFund(formData);
            await get().fetchFunds();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create wealth fund';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateFund: async (id, formData) => {
        set({ loading: true, error: null });
        try {
            const res = await adminWealthAPI.updateFund(id, formData);
            await get().fetchFunds();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update wealth fund';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteFund: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await adminWealthAPI.deleteFund(id);
            await get().fetchFunds();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete wealth fund';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
