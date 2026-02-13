import { create } from 'zustand';
import { earningsAPI } from '../services/api';

export const useEarningsStore = create((set, get) => ({
    earnings: null,
    loading: false,
    error: null,
    lastFetch: 0,

    isStale: (lastFetchTime, duration = 5 * 60 * 1000) => {
        return Date.now() - lastFetchTime > duration;
    },

    fetchEarnings: async (force = false) => {
        const { lastFetch, loading, isStale, earnings } = get();

        if (!force && (loading || !isStale(lastFetch))) {
            return earnings;
        }

        set({ loading: true, error: null });

        try {
            const response = await earningsAPI.getSummary();
            const newEarnings = response.data.earnings;

            set({
                earnings: newEarnings,
                lastFetch: Date.now(),
                loading: false
            });
            return newEarnings;
        } catch (error) {
            console.error('Failed to fetch earnings:', error);
            set({
                loading: false,
                error: 'Failed to fetch earnings data'
            });
            return earnings;
        }
    },

    invalidateCache: () => {
        set({ lastFetch: 0 });
    },

    reset: () => {
        set({
            earnings: null,
            loading: false,
            error: null,
            lastFetch: 0
        });
    }
}));
