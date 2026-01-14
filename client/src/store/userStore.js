import { create } from 'zustand';
import { userAPI } from '../services/api';

export const useUserStore = create((set, get) => ({
    wallet: { incomeWallet: 0, personalWallet: 0 },
    profile: null,
    lastWalletFetch: 0,
    lastProfileFetch: 0,
    loading: {
        wallet: false,
        profile: false,
        tasks: false
    },
    error: null,

    // Helper to check if data is stale (defaults to 5 minutes)
    isStale: (lastFetchTime, duration = 5 * 60 * 1000) => {
        return Date.now() - lastFetchTime > duration;
    },

    fetchWallet: async (force = false) => {
        const { lastWalletFetch, loading, isStale, wallet } = get();

        // If not forcing, already loading, or data is fresh, skip fetch
        if (!force && (loading.wallet || !isStale(lastWalletFetch))) {
            return wallet;
        }

        set(state => ({ loading: { ...state.loading, wallet: true }, error: null }));

        try {
            const response = await userAPI.getWallet();
            const newWallet = response.data.wallet;

            set(state => ({
                wallet: newWallet,
                lastWalletFetch: Date.now(),
                loading: { ...state.loading, wallet: false }
            }));
            return newWallet;
        } catch (error) {
            console.error('Failed to fetch wallet:', error);
            set(state => ({
                loading: { ...state.loading, wallet: false },
                error: 'Failed to fetch wallet balance'
            }));
            return wallet; // Return existing wallet on error
        }
    },

    fetchProfile: async (force = false) => {
        const { lastProfileFetch, loading, isStale, profile } = get();

        if (!force && (loading.profile || !isStale(lastProfileFetch))) {
            return profile;
        }

        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));

        try {
            const response = await userAPI.getProfile();
            const newProfile = response.data.user;

            set(state => ({
                profile: newProfile,
                lastProfileFetch: Date.now(),
                loading: { ...state.loading, profile: false }
            }));
            return newProfile;
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            set(state => ({
                loading: { ...state.loading, profile: false },
                error: 'Failed to fetch profile'
            }));
            return profile;
        }
    },

    // Tasks State
    tasks: [],
    dailyStats: { dailyIncome: 0, perVideoIncome: 0 },
    internRestriction: null,
    isSunday: false,
    earningsStats: null,
    lastTasksFetch: 0,

    fetchTasks: async (force = false) => {
        const { lastTasksFetch, loading, isStale, tasks } = get();
        // Since tasks change daily or on completion, maybe 5 mins cache is okay, 
        // but completion invalidates it locally or we should force refresh on completion.
        // We will keep standard 5 min cache, but 'force' will be used on 'Sync'.
        if (!force && (loading.tasks || !isStale(lastTasksFetch))) {
            return tasks;
        }

        set(state => ({ loading: { ...state.loading, tasks: true }, error: null }));

        try {
            // We need taskAPI here. It wasn't imported. I need to update imports.
            // But wait, existing code imports userAPI. I need to check if taskAPI is exported from '../services/api'. 
            // It was used in Task.jsx.
            const { taskAPI } = await import('../services/api'); // Dynamic import to avoid circular dep if any, or just import at top. 
            // Better to import at top. I will do a separate edit for imports. Use dynamic for now or assume I'll fix imports.
            // Actually, I can't easily add top-level import with replace_file_content unless I target top. 
            // I'll assume I will fix imports in next step or use dynamic import which is safe.
            const response = await taskAPI.getDailyTasks();

            const data = response.data;

            set(state => ({
                tasks: data.tasks,
                dailyStats: {
                    dailyIncome: data.dailyIncome,
                    perVideoIncome: data.perVideoIncome
                },
                internRestriction: data.internRestriction,
                isSunday: data.isSunday || false,
                earningsStats: data.earningsStats || null,
                lastTasksFetch: Date.now(),
                loading: { ...state.loading, tasks: false }
            }));
            return data.tasks;
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set(state => ({
                loading: { ...state.loading, tasks: false },
                error: 'Failed to fetch tasks'
            }));
            return tasks;
        }
    },

    // Sync all user data at once
    syncData: async () => {
        const { fetchWallet, fetchProfile, fetchTasks } = get();
        await Promise.all([
            fetchWallet(true),
            fetchProfile(true),
            fetchTasks(true)
        ]);
        return true;
    },

    // Reset store (useful for logout)
    reset: () => {
        set({
            wallet: { incomeWallet: 0, personalWallet: 0 },
            profile: null,
            lastWalletFetch: 0,
            lastProfileFetch: 0,
            loading: { wallet: false, profile: false },
            error: null
        });
    }
}));
