import { create } from 'zustand';
import { adminTaskAPI } from '../services/api';

export const useAdminTaskStore = create((set, get) => ({
    tasks: [],
    playlists: [],
    videoCount: 0,
    loading: false,
    error: null,

    fetchTaskData: async () => {
        set({ loading: true, error: null });
        try {
            const [tasksRes, playlistsRes] = await Promise.all([
                adminTaskAPI.getPool(),
                adminTaskAPI.getPlaylists()
            ]);
            set({ 
                tasks: tasksRes.data.videos || [], 
                playlists: playlistsRes.data.playlists,
                videoCount: playlistsRes.data.videoCount,
                loading: false 
            });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch task data';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    uploadTask: async (data) => {
        set({ loading: true, error: null });
        try {
            await adminTaskAPI.upload(data);
            await get().fetchTaskData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to upload task';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminTaskAPI.delete(id);
            await get().fetchTaskData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete task';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    addPlaylist: async (data) => {
        set({ loading: true, error: null });
        try {
            await adminTaskAPI.addPlaylist(data);
            await get().fetchTaskData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add playlist';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deletePlaylist: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminTaskAPI.deletePlaylist(id);
            await get().fetchTaskData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete playlist';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    syncVideos: async () => {
        set({ loading: true, error: null });
        try {
            await adminTaskAPI.syncVideos();
            await get().fetchTaskData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to sync videos';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
