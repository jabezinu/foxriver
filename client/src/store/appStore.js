import { create } from 'zustand';

export const useAppStore = create((set) => ({
    language: localStorage.getItem('foxriver_language') || 'en',
    showFirstEntryPopup: false,

    setLanguage: (lang) => {
        localStorage.setItem('foxriver_language', lang);
        set({ language: lang });
    },

    setShowFirstEntryPopup: (show) => set({ showFirstEntryPopup: show }),
}));
