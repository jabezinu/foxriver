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
            const bankChangeInfo = response.data.bankChangeInfo;

            set(state => ({
                profile: newProfile,
                lastProfileFetch: Date.now(),
                loading: { ...state.loading, profile: false }
            }));
            
            // Return profile with bankChangeInfo attached for convenience
            return { ...newProfile, bankChangeInfo };
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            set(state => ({
                loading: { ...state.loading, profile: false },
                error: 'Failed to fetch profile'
            }));
            return profile;
        }
    },

    // Sync wallet and profile data
    syncData: async () => {
        const { fetchWallet, fetchProfile } = get();
        await Promise.all([
            fetchWallet(true),
            fetchProfile(true)
        ]);
        return true;
    },

    updateProfile: async (profileData) => {
        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));
        try {
            const response = await userAPI.updateProfile(profileData);
            if (response.data.success) {
                // Refresh profile after update
                await get().fetchProfile(true);
                return { success: true, data: response.data.user };
            }
            throw new Error(response.data.message || 'Update failed');
        } catch (error) {
            console.error('Failed to update profile:', error);
            const message = error.response?.data?.message || 'Failed to update profile';
            set(state => ({ loading: { ...state.loading, profile: false }, error: message }));
            return { success: false, message };
        }
    },

    uploadProfilePhoto: async (formData) => {
        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));
        try {
            const response = await userAPI.uploadProfilePhoto(formData);
            if (response.data.success) {
                await get().fetchProfile(true);
                return { success: true, data: response.data };
            }
            throw new Error(response.data.message || 'Upload failed');
        } catch (error) {
            console.error('Failed to upload photo:', error);
            const message = error.response?.data?.message || 'Failed to upload photo';
            set(state => ({ loading: { ...state.loading, profile: false }, error: message }));
            return { success: false, message };
        }
    },

    deleteProfilePhoto: async () => {
        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));
        try {
            const response = await userAPI.deleteProfilePhoto();
            if (response.data.success) {
                await get().fetchProfile(true);
                return { success: true };
            }
            throw new Error(response.data.message || 'Delete failed');
        } catch (error) {
            console.error('Failed to delete photo:', error);
            const message = error.response?.data?.message || 'Failed to delete photo';
            set(state => ({ loading: { ...state.loading, profile: false }, error: message }));
            return { success: false, message };
        }
    },

    setBankAccount: async (bankData) => {
        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));
        try {
            const response = await userAPI.setBankAccount(bankData);
            // Refresh profile to get updated status and bank info
            await get().fetchProfile(true);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Failed to set bank account:', error);
            const message = error.response?.data?.message || 'Failed to update bank account';
            set(state => ({ loading: { ...state.loading, profile: false }, error: message }));
            return { success: false, message };
        }
    },

    cancelBankChange: async () => {
        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));
        try {
            const response = await userAPI.cancelBankChange();
            await get().fetchProfile(true);
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Failed to cancel bank change:', error);
            const message = error.response?.data?.message || 'Failed to cancel bank change';
            set(state => ({ loading: { ...state.loading, profile: false }, error: message }));
            return { success: false, message };
        }
    },

    confirmBankChange: async (confirmed) => {
        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));
        try {
            const response = await userAPI.confirmBankChange(confirmed);
            // Refresh profile to update status/history
            await get().fetchProfile(true);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Failed to confirm bank change:', error);
            const message = error.response?.data?.message || 'Failed to process confirmation';
            set(state => ({ loading: { ...state.loading, profile: false }, error: message }));
            return { success: false, message };
        }
    },

    changeLoginPassword: async (passwordData) => {
        set(state => ({ loading: { ...state.loading, profile: true }, error: null }));
        try {
            const response = await userAPI.changeLoginPassword(passwordData);
            set(state => ({ loading: { ...state.loading, profile: false } }));
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Failed to change password:', error);
            const message = error.response?.data?.message || 'Failed to change password';
            set(state => ({ loading: { ...state.loading, profile: false }, error: message }));
            return { success: false, message };
        }
    },

    // Invalidate specific cache fields
    invalidateCache: (fields = []) => {
        set(state => {
            const updates = {};
            if (fields.length === 0 || fields.includes('profile')) {
                updates.lastProfileFetch = 0;
            }
            if (fields.length === 0 || fields.includes('wallet')) {
                updates.lastWalletFetch = 0;
            }
            return updates;
        });
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
