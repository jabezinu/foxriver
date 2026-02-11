import { create } from 'zustand';
import { adminStatsAPI } from '../services/api';

export const useStatsStore = create((set, get) => ({
    stats: null,
    lastStatsFetch: 0,
    loading: false,
    error: null,

    // Helper to check if data is stale (defaults to 1 minute for dashboard)
    isStale: (lastFetchTime, duration = 60 * 1000) => {
        return Date.now() - lastFetchTime > duration;
    },

    fetchStats: async (force = false) => {
        const { lastStatsFetch, loading, isStale, stats } = get();

        // If not forcing, already loading, or data is fresh, skip fetch
        if (!force && (loading || !isStale(lastStatsFetch))) {
            return stats;
        }

        set({ loading: true, error: null });

        try {
            const response = await adminStatsAPI.getStats();
            const newStats = response.data.stats;

            set({
                stats: newStats,
                lastStatsFetch: Date.now(),
                loading: false
            });
            return newStats;
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            set({
                loading: false,
                error: 'Failed to fetch dashboard statistics'
            });
            return stats; // Return existing stats on error
        }
    },

    // Invalidate cache
    invalidateCache: () => {
        set({ lastStatsFetch: 0 });
    },

    // Reset store
    reset: () => {
        set({
            stats: null,
            lastStatsFetch: 0,
            loading: false,
            error: null
        });
    }
}));
