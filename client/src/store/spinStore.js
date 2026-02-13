import { create } from 'zustand';
import { spinAPI, slotTierAPI } from '../services/api';

export const useSpinStore = create((set, get) => ({
    history: [],
    stats: null,
    tiers: [],
    monthlyWinners: [],
    loading: {
        history: false,
        tiers: false,
        winners: false,
        spin: false
    },
    error: null,

    fetchTiers: async () => {
        set(state => ({ loading: { ...state.loading, tiers: true }, error: null }));
        try {
            const response = await slotTierAPI.getTiers();
            if (response.data.success) {
                set(state => ({ tiers: response.data.data, loading: { ...state.loading, tiers: false } }));
                return response.data.data;
            }
            throw new Error('Failed to fetch tiers');
        } catch (error) {
            console.error('Error fetching tiers:', error);
            set(state => ({ loading: { ...state.loading, tiers: false }, error: 'Failed to load tiers' }));
            return [];
        }
    },

    fetchHistory: async () => {
        set(state => ({ loading: { ...state.loading, history: true }, error: null }));
        try {
            const response = await spinAPI.getHistory();
            set(state => ({
                history: response.data.data.spins,
                stats: response.data.data.stats,
                loading: { ...state.loading, history: false }
            }));
            return response.data.data;
        } catch (error) {
            console.error('Error fetching history:', error);
            set(state => ({ loading: { ...state.loading, history: false }, error: 'Failed to load history' }));
            return null;
        }
    },

    fetchMonthlyWinners: async () => {
        set(state => ({ loading: { ...state.loading, winners: true }, error: null }));
        try {
            const response = await spinAPI.getMonthlyWinners();
            if (response.data.success) {
                set(state => ({ monthlyWinners: response.data.data, loading: { ...state.loading, winners: false } }));
                return response.data.data;
            }
            throw new Error('Failed to fetch winners');
        } catch (error) {
            console.error('Error fetching winners:', error);
            set(state => ({ loading: { ...state.loading, winners: false } }));
            return [];
        }
    },

    spin: async (spinData) => {
        set(state => ({ loading: { ...state.loading, spin: true }, error: null }));
        try {
            const response = await spinAPI.spin(spinData);
            set(state => ({ loading: { ...state.loading, spin: false } }));
            // Refresh history after spin
            get().fetchHistory();
            get().fetchMonthlyWinners();
            return { success: true, data: response.data.data };
        } catch (error) {
            console.error('Error spinning:', error);
            const message = error.response?.data?.message || 'Error playing slot machine';
            set(state => ({ loading: { ...state.loading, spin: false }, error: message }));
            return { success: false, message };
        }
    },

    reset: () => {
        set({
            history: [],
            stats: null,
            tiers: [],
            monthlyWinners: [],
            loading: {
                history: false,
                tiers: false,
                winners: false,
                spin: false
            },
            error: null
        });
    }
}));
