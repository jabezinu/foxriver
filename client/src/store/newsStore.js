import { create } from 'zustand';
import { newsAPI } from '../services/api';

export const useNewsStore = create((set, get) => ({
    news: [],
    popupNews: null,
    loading: false,
    error: null,

    fetchNews: async (force = false) => {
        const { loading, news } = get();
        if (loading && !force) return news;

        set({ loading: true, error: null });
        try {
            const response = await newsAPI.getNews();
            const data = response.data.news || [];
            set({ news: data, loading: false });
            return data;
        } catch (error) {
            console.error('Failed to fetch news:', error);
            set({ loading: false, error: 'Failed to load news' });
            return news;
        }
    },

    fetchPopupNews: async () => {
        try {
            const response = await newsAPI.getPopupNews();
            const data = response.data.news || null;
            set({ popupNews: data });
            return data;
        } catch (error) {
            console.error('Failed to fetch popup news:', error);
            return null;
        }
    },

    reset: () => {
        set({
            news: [],
            popupNews: null,
            loading: false,
            error: null
        });
    }
}));
