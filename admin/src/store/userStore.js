import { create } from 'zustand';
import { adminUserAPI } from '../services/api';

export const useAdminUserStore = create((set, get) => ({
    users: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0
    },
    lastFetch: 0, // Added lastFetch state property

    fetchUserReferenceTree: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await adminUserAPI.getUserReferenceTree(id);
            set({ loading: false });
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Tree Trace Failed';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    fetchUserHistory: async (id) => {
        set({ loading: true, error: null });
        try {
            const [depositsRes, withdrawalsRes] = await Promise.all([
                adminUserAPI.getUserDeposits(id),
                adminUserAPI.getUserWithdrawals(id)
            ]);
            set({ loading: false });
            return { 
                success: true, 
                data: {
                    deposits: depositsRes.data.deposits,
                    withdrawals: withdrawalsRes.data.withdrawals
                }
            };
        } catch (error) {
            const message = error.response?.data?.message || 'History Retrieval Failed';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    fetchCurrentRestrictions: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminUserAPI.getCurrentRestrictions();
            set({ loading: false });
            return { success: true, data: res.data.restrictions };
        } catch (error) {
            const message = error.response?.data?.message || 'Restriction Signal Error';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    invalidateCache: () => set({ lastFetch: 0 }),

    fetchUsers: async (params = {}) => {
        set({ loading: true, error: null });
        try {
            const res = await adminUserAPI.getAllUsers(params);
            set({ 
                users: res.data.users, 
                loading: false,
                pagination: {
                    ...get().pagination,
                    total: res.data.total || res.data.users.length
                }
            });
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch users';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateUser: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminUserAPI.updateUser(id, data);
            await get().fetchUsers(); // Refresh list
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update user';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await adminUserAPI.deleteUser(id);
            await get().fetchUsers(); // Refresh list
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete user';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    restrictAllUsers: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminUserAPI.restrictAllUsers(data);
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to restrict users';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
