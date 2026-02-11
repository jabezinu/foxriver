import { useCallback, useRef } from 'react';
import { useUserStore } from '../store/userStore';

/**
 * Custom hook for managing wallet updates with optimistic updates and sync
 * Provides methods to update wallet instantly and sync with backend
 */
export const useWalletSync = () => {
    const { wallet, invalidateCache, fetchWallet } = useUserStore();
    const syncTimeoutRef = useRef(null);

    /**
     * Optimistically update wallet balance
     * @param {Object} updates - Object with incomeWallet and/or personalWallet changes
     * @param {number} updates.incomeWallet - Amount to add/subtract from income wallet
     * @param {number} updates.personalWallet - Amount to add/subtract from personal wallet
     */
    const updateWalletOptimistic = useCallback((updates) => {
        useUserStore.setState((state) => ({
            wallet: {
                incomeWallet: state.wallet.incomeWallet + (updates.incomeWallet || 0),
                personalWallet: state.wallet.personalWallet + (updates.personalWallet || 0)
            }
        }));
    }, []);

    /**
     * Set wallet to exact values (used after API response)
     * @param {Object} newWallet - Object with incomeWallet and personalWallet
     */
    const setWalletExact = useCallback((newWallet) => {
        useUserStore.setState({
            wallet: newWallet
        });
    }, []);

    /**
     * Invalidate wallet cache and trigger a refresh
     * Useful when you want to ensure fresh data from server
     */
    const syncWallet = useCallback(async () => {
        // Clear any pending sync
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        invalidateCache(['wallet']);
        return fetchWallet(true);
    }, [invalidateCache, fetchWallet]);

    /**
     * Debounced sync - useful for multiple rapid updates
     * @param {number} delay - Delay in milliseconds before syncing
     */
    const debouncedSync = useCallback((delay = 2000) => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            syncWallet();
        }, delay);
    }, [syncWallet]);

    /**
     * Handle wallet-affecting action with optimistic update
     * @param {Function} apiCall - Async function that makes the API call
     * @param {Object} optimisticUpdate - Object with incomeWallet and/or personalWallet changes
     * @param {Object} options - Additional options
     * @param {boolean} options.syncAfter - Whether to sync after action (default: true)
     * @param {number} options.syncDelay - Delay before syncing (default: 1000ms)
     * @returns {Promise} Result from API call
     */
    const executeWithOptimisticUpdate = useCallback(
        async (apiCall, optimisticUpdate, options = {}) => {
            const { syncAfter = true, syncDelay = 1000 } = options;

            // Apply optimistic update immediately
            updateWalletOptimistic(optimisticUpdate);

            try {
                // Execute the API call
                const result = await apiCall();

                // If API returns new wallet data, use it
                if (result.data?.newWalletBalances) {
                    setWalletExact(result.data.newWalletBalances);
                } else if (syncAfter) {
                    // Otherwise, sync with server after delay
                    debouncedSync(syncDelay);
                }

                return result;
            } catch (error) {
                // On error, revert optimistic update by syncing
                await syncWallet();
                throw error;
            }
        },
        [updateWalletOptimistic, setWalletExact, debouncedSync, syncWallet]
    );

    return {
        wallet,
        updateWalletOptimistic,
        setWalletExact,
        syncWallet,
        debouncedSync,
        executeWithOptimisticUpdate
    };
};
