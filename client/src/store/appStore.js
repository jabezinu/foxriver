import { create } from 'zustand';

export const useAppStore = create((set) => ({
    language: localStorage.getItem('foxriver_language') || 'en',
    unreadMessages: 0,
    showFirstEntryPopup: false,
    messageQueue: [],

    setLanguage: (lang) => {
        localStorage.setItem('foxriver_language', lang);
        set({ language: lang });
    },

    setUnreadMessages: (count) => set({ unreadMessages: count }),

    setShowFirstEntryPopup: (show) => set({ showFirstEntryPopup: show }),

    setMessageQueue: (queue) => set({ messageQueue: queue }),

    nextMessage: () => set((state) => ({ messageQueue: state.messageQueue.slice(1) })),
}));
