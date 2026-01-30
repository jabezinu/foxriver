import { createContext, useContext, useState, useEffect } from 'react';
import { systemAPI } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const res = await systemAPI.getSettings();
            setSettings(res.data.settings);
        } catch (error) {
            console.error('Failed to fetch system settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
        
        // Refresh settings every 5 minutes to catch admin changes
        const interval = setInterval(fetchSettings, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
