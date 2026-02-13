import { create } from 'zustand';
import { wealthAPI } from '../services/api';

export const useWealthStore = create((set, get) => ({
    funds: [],
    myInvestments: [],
    currentFund: null,
    loading: {
        funds: false,
        investments: false,
        fundDetail: false,
        investing: false
    },
    error: null,

    fetchFunds: async (force = false) => {
        const { loading, funds } = get();
        if (loading.funds && !force) return funds;

        set(state => ({ loading: { ...state.loading, funds: true }, error: null }));
        try {
            const response = await wealthAPI.getFunds();
            const data = response.data.data || [];
            set(state => ({ funds: data, loading: { ...state.loading, funds: false } }));
            return data;
        } catch (error) {
            console.error('Failed to fetch wealth funds:', error);
            set(state => ({ loading: { ...state.loading, funds: false }, error: 'Failed to load funds' }));
            return funds;
        }
    },

    fetchFundById: async (id) => {
        set(state => ({ loading: { ...state.loading, fundDetail: true }, error: null }));
        try {
            const response = await wealthAPI.getFundById(id);
            const fund = response.data.data;
            set(state => ({ currentFund: fund, loading: { ...state.loading, fundDetail: false } }));
            return fund;
        } catch (error) {
            console.error('Error fetching fund by id:', error);
            set(state => ({ loading: { ...state.loading, fundDetail: false }, error: 'Failed to load fund details' }));
            return null;
        }
    },

    fetchMyInvestments: async () => {
        set(state => ({ loading: { ...state.loading, investments: true }, error: null }));
        try {
            const response = await wealthAPI.getMyInvestments();
            const investments = response.data.data || [];
            set(state => ({ myInvestments: investments, loading: { ...state.loading, investments: false } }));
            return investments;
        } catch (error) {
            console.error('Error fetching my investments:', error);
            set(state => ({ loading: { ...state.loading, investments: false } }));
            return [];
        }
    },

    invest: async (investData) => {
        set(state => ({ loading: { ...state.loading, investing: true }, error: null }));
        try {
            const response = await wealthAPI.invest(investData);
            set(state => ({ loading: { ...state.loading, investing: false } }));
            // Refresh investments
            get().fetchMyInvestments();
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Error creating investment:', error);
            const message = error.response?.data?.message || 'Error creating investment';
            set(state => ({ loading: { ...state.loading, investing: false }, error: message }));
            return { success: false, message };
        }
    },

    reset: () => {
        set({
            funds: [],
            myInvestments: [],
            currentFund: null,
            loading: {
                funds: false,
                investments: false,
                fundDetail: false,
                investing: false
            },
            error: null
        });
    }
}));
