import { create } from 'zustand';
import { depositAPI, bankAPI } from '../services/api';

export const useDepositStore = create((set, get) => ({
    // Bank methods
    methods: [],
    loadingMethods: false,

    // Deposit history
    history: [],
    loadingHistory: false,

    // Allowed amounts
    amounts: [],
    restrictedAmounts: [],
    loadingAmounts: false,

    // Current deposit
    currentDeposit: null,
    submitting: false,

    error: null,

    // Fetch available banks
    fetchBanks: async () => {
        set({ loadingMethods: true, error: null });

        try {
            const response = await bankAPI.getBanks();
            const bankMethods = response.data.data.map(bank => ({
                id: bank._id || bank.id,
                name: bank.bankName,
                account: bank.accountNumber,
                holder: bank.accountHolderName
            }));

            set({
                methods: bankMethods,
                loadingMethods: false
            });
            return bankMethods;
        } catch (error) {
            console.error('Failed to fetch banks:', error);
            set({
                loadingMethods: false,
                error: 'Failed to load payment methods'
            });
            return [];
        }
    },

    // Fetch allowed deposit amounts
    fetchAllowedAmounts: async () => {
        set({ loadingAmounts: true, error: null });

        try {
            const response = await depositAPI.getAllowedAmounts();
            const amounts = response.data.allowedAmounts;
            const restrictedAmounts = response.data.userContext?.restrictedAmounts || [];

            set({
                amounts,
                restrictedAmounts,
                loadingAmounts: false
            });
            return { amounts, restrictedAmounts };
        } catch (error) {
            console.error('Failed to fetch allowed amounts:', error);
            set({
                loadingAmounts: false,
                error: 'Failed to load deposit amounts'
            });
            return { amounts: [], restrictedAmounts: [] };
        }
    },

    // Fetch deposit history
    fetchHistory: async () => {
        set({ loadingHistory: true, error: null });

        try {
            const response = await depositAPI.getUserDeposits();
            set({
                history: response.data.deposits,
                loadingHistory: false
            });
            return response.data.deposits;
        } catch (error) {
            console.error('Failed to fetch deposit history:', error);
            set({
                loadingHistory: false,
                error: 'Failed to load deposit history'
            });
            return [];
        }
    },

    // Create a new deposit
    createDeposit: async (depositData) => {
        set({ submitting: true, error: null });

        try {
            const response = await depositAPI.create(depositData);
            set({
                currentDeposit: response.data.deposit,
                submitting: false
            });
            return {
                success: true,
                deposit: response.data.deposit
            };
        } catch (error) {
            console.error('Failed to create deposit:', error);
            const message = error.response?.data?.message || 'Failed to create deposit';
            set({
                submitting: false,
                error: message
            });
            return {
                success: false,
                message
            };
        }
    },

    // Submit FT (Fund Transfer) proof
    submitFT: async (formData) => {
        set({ submitting: true, error: null });

        try {
            const response = await depositAPI.submitFT(formData);
            set({
                currentDeposit: response.data.deposit,
                submitting: false
            });
            return {
                success: true,
                deposit: response.data.deposit
            };
        } catch (error) {
            console.error('Failed to submit FT:', error);
            const message = error.response?.data?.message || 'Failed to submit FT';
            set({
                submitting: false,
                error: message
            });
            return {
                success: false,
                message
            };
        }
    },

    // Initialize deposit data (fetch banks, amounts, and history)
    initializeDeposit: async () => {
        const { fetchBanks, fetchAllowedAmounts, fetchHistory } = get();
        await Promise.all([
            fetchBanks(),
            fetchAllowedAmounts(),
            fetchHistory()
        ]);
    },

    // Clear current deposit
    clearCurrentDeposit: () => {
        set({ currentDeposit: null });
    },

    // Reset store
    reset: () => {
        set({
            methods: [],
            loadingMethods: false,
            history: [],
            loadingHistory: false,
            amounts: [],
            restrictedAmounts: [],
            loadingAmounts: false,
            currentDeposit: null,
            submitting: false,
            error: null
        });
    }
}));
