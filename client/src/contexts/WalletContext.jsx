import { createContext, useContext } from 'react';
import { useWalletSync } from '../hooks/useWalletSync';

const WalletContext = createContext(null);

/**
 * WalletProvider - Provides wallet sync functionality to all child components
 * Wraps the app to enable instant wallet updates across the application
 */
export const WalletProvider = ({ children }) => {
    const walletSync = useWalletSync();

    return (
        <WalletContext.Provider value={walletSync}>
            {children}
        </WalletContext.Provider>
    );
};

/**
 * Hook to use wallet sync functionality
 * Must be used within WalletProvider
 */
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};
