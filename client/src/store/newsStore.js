import { create } from 'zustand';
import { newsAPI } from '../services/api';

export const useNewsStore = create((set, get) => ({
    news: [],
    popupNews: null,
    loading: false,
    error: null,

    // News popup management
    shouldShowNewsPopup: false,
    latestNews: null,
    newsQueue: [], // Array of all news to show
    currentNewsIndex: 0, // Track which news is currently being shown

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

    setNewsQueue: (newsArray) => {
        if (newsArray && newsArray.length > 0) {
            set({ 
                newsQueue: newsArray, 
                currentNewsIndex: 0,
                latestNews: newsArray[0],
                shouldShowNewsPopup: true
            });
        } else {
            set({ 
                newsQueue: [], 
                currentNewsIndex: 0,
                latestNews: null,
                shouldShowNewsPopup: false
            });
        }
    },

    showNextNews: () => {
        set((state) => {
            const nextIndex = state.currentNewsIndex + 1;
            if (nextIndex < state.newsQueue.length) {
                return {
                    currentNewsIndex: nextIndex,
                    latestNews: state.newsQueue[nextIndex]
                };
            } else {
                // No more news to show
                return {
                    shouldShowNewsPopup: false,
                    latestNews: null,
                    newsQueue: [],
                    currentNewsIndex: 0
                };
            }
        });
    },

    setLatestNews: (news) => {
        set({ latestNews: news });
    },

    hideNewsPopup: () => {
        set({ shouldShowNewsPopup: false, newsQueue: [], currentNewsIndex: 0, latestNews: null });
    },

    reset: () => {
        set({
            news: [],
            popupNews: null,
            loading: false,
            error: null,
            shouldShowNewsPopup: false,
            latestNews: null,
            newsQueue: [],
            currentNewsIndex: 0
        });
    }
}));
