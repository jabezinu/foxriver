import { create } from 'zustand';
import { adminReferralAPI } from '../services/api';

export const useAdminReferralStore = create((set, get) => ({
    commissions: [],
    settings: {
        commissionPercentA: 10, commissionPercentB: 5, commissionPercentC: 2,
        upgradeCommissionPercentA: 10, upgradeCommissionPercentB: 5, upgradeCommissionPercentC: 2,
        maxReferralsPerUser: 0,
        salaryDirect15Threshold: 15, salaryDirect15Amount: 15000,
        salaryDirect20Threshold: 20, salaryDirect20Amount: 20000,
        salaryDirect10Threshold: 10, salaryDirect10Amount: 10000,
        salaryNetwork40Threshold: 40, salaryNetwork40Amount: 48000
    },
    loading: false,
    error: null,

    fetchData: async () => {
        set({ loading: true, error: null });
        try {
            const [commRes, setRes] = await Promise.all([
                adminReferralAPI.getCommissions(),
                adminReferralAPI.getSettings()
            ]);
            set({ 
                commissions: commRes.data.commissions, 
                settings: setRes.data.settings,
                loading: false 
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Network Intelligence Offline';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateSettings: async (settings) => {
        set({ loading: true, error: null });
        try {
            await adminReferralAPI.updateSettings(settings);
            set({ settings, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Protocol Synchronization Error';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
