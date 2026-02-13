import { create } from 'zustand';
import { rankUpgradeAPI, membershipAPI } from '../services/api';

export const useRankUpgradeStore = create((set, get) => ({
    requests: [],
    tiers: [],
    loading: {
        requests: false,
        tiers: false,
        submitting: false
    },
    error: null,

    fetchTiers: async () => {
        set(state => ({ loading: { ...state.loading, tiers: true }, error: null }));
        try {
            const response = await membershipAPI.getTiers();
            const tiers = response.data.tiers || [];
            set(state => ({ tiers, loading: { ...state.loading, tiers: false } }));
            return tiers;
        } catch (error) {
            console.error('Failed to fetch tiers:', error);
            set(state => ({ loading: { ...state.loading, tiers: false }, error: 'Failed to load tiers' }));
            return [];
        }
    },

    fetchUserRequests: async () => {
        set(state => ({ loading: { ...state.loading, requests: true }, error: null }));
        try {
            const response = await rankUpgradeAPI.getUserRequests();
            const requests = response.data.requests || [];
            set(state => ({ requests, loading: { ...state.loading, requests: false } }));
            return requests;
        } catch (error) {
            console.error('Failed to fetch rank requests:', error);
            set(state => ({ loading: { ...state.loading, requests: false } }));
            return [];
        }
    },

    createUpgradeRequest: async (upgradeData) => {
        set(state => ({ loading: { ...state.loading, submitting: true }, error: null }));
        try {
            const response = await rankUpgradeAPI.createRequest(upgradeData);
            set(state => ({ loading: { ...state.loading, submitting: false } }));
            get().fetchUserRequests();
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Failed to create upgrade request:', error);
            const message = error.response?.data?.message || 'Failed to upgrade rank';
            set(state => ({ loading: { ...state.loading, submitting: false }, error: message }));
            return { success: false, message };
        }
    },

    cancelRequest: async (id) => {
        try {
            await rankUpgradeAPI.cancelRequest(id);
            get().fetchUserRequests();
            return { success: true };
        } catch (error) {
            console.error('Failed to cancel request:', error);
            return { success: false, message: error.response?.data?.message || 'Failed to cancel request' };
        }
    },

    reset: () => {
        set({
            requests: [],
            tiers: [],
            loading: {
                requests: false,
                tiers: false,
                submitting: false
            },
            error: null
        });
    }
}));
