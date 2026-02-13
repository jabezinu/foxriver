import { create } from 'zustand';
import { referralAPI } from '../services/api';

export const useReferralStore = create((set, get) => ({
    downline: null,
    commissions: [],
    commissionTotals: { A: 0, B: 0, C: 0, total: 0 },
    salaryData: null,
    loading: false,
    error: null,

    fetchTeamData: async (force = false) => {
        const { loading } = get();
        if (loading && !force) return;

        set({ loading: true, error: null });
        try {
            const [downlineRes, commissionRes, salaryRes] = await Promise.all([
                referralAPI.getDownline(),
                referralAPI.getCommissions(),
                referralAPI.getSalary()
            ]);

            set({
                downline: downlineRes.data.downline || null,
                commissions: commissionRes.data.commissions || [],
                commissionTotals: commissionRes.data.totals || { A: 0, B: 0, C: 0, total: 0 },
                salaryData: salaryRes.data || null,
                loading: false
            });
            return { success: true };
        } catch (error) {
            console.error('Failed to fetch team data:', error);
            const message = error.response?.status === 429 
                ? 'Too many requests. Please wait a moment.' 
                : (error.response?.data?.message || 'Failed to load team data');
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    reset: () => {
        set({
            downline: null,
            commissions: [],
            commissionTotals: { A: 0, B: 0, C: 0, total: 0 },
            salaryData: null,
            loading: false,
            error: null
        });
    }
}));
