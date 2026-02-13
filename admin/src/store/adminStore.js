import { create } from 'zustand';
import { adminManagementAPI } from '../services/api';

export const useAdminManagementStore = create((set, get) => ({
    admins: [],
    loading: false,
    error: null,

    fetchAdmins: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminManagementAPI.getAdmins();
            const normalizedAdmins = res.data.admins.map(admin => {
                let parsedPermissions = admin.permissions || [];
                if (typeof parsedPermissions === 'string') {
                    try {
                        parsedPermissions = JSON.parse(parsedPermissions);
                    } catch (e) {
                        parsedPermissions = [];
                    }
                }
                if (!Array.isArray(parsedPermissions)) parsedPermissions = [];
                return { ...admin, permissions: parsedPermissions };
            });
            set({ admins: normalizedAdmins, loading: false });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registry Access Error';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    createAdmin: async (data) => {
        set({ loading: true, error: null });
        try {
            await adminManagementAPI.createAdmin(data);
            get().fetchAdmins();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Personnel Authorization Failure';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updatePermissions: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await adminManagementAPI.updatePermissions(id, data);
            get().fetchAdmins();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Clearance Update Rejection';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteAdmin: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminManagementAPI.deleteAdmin(id);
            get().fetchAdmins();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Access Revocation Failed';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
