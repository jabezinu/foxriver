import { create } from 'zustand';
import { adminNewsAPI } from '../services/api';

export const useAdminNewsStore = create((set, get) => ({
    news: [],
    loading: false,
    error: null,

    fetchNews: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminNewsAPI.getAll();
            set({ news: res.data.news, loading: false });
            return { success: true, data: res.data.news };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch news';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    createNews: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminNewsAPI.create(data);
            await get().fetchNews();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create news';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateNews: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await adminNewsAPI.update(id, data);
            await get().fetchNews();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update news';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteNews: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await adminNewsAPI.delete(id);
            await get().fetchNews();
            return { success: true, data: res.data };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete news';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
