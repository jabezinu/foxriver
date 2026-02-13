import { create } from 'zustand';
import { adminCoursesAPI } from '../services/api';

export const useAdminCoursesStore = create((set, get) => ({
    categories: [],
    courses: [],
    loading: false,
    error: null,

    fetchCategoryData: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminCoursesAPI.getCategories();
            set({ categories: res.data.categories, loading: false });
            return { success: true, data: res.data.categories };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch categories';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    fetchCourseData: async () => {
        set({ loading: true, error: null });
        try {
            const res = await adminCoursesAPI.getCourses();
            set({ courses: res.data.courses, loading: false });
            return { success: true, data: res.data.courses };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to fetch courses';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    createCategory: async (data) => {
        set({ loading: true, error: null });
        try {
            await adminCoursesAPI.createCategory(data);
            await get().fetchCategoryData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create category';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateCategory: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await adminCoursesAPI.updateCategory(id, data);
            await get().fetchCategoryData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update category';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminCoursesAPI.deleteCategory(id);
            await get().fetchCategoryData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete category';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    createCourse: async (data) => {
        set({ loading: true, error: null });
        try {
            await adminCoursesAPI.createCourse(data);
            await get().fetchCourseData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create course';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    updateCourse: async (id, data) => {
        set({ loading: true, error: null });
        try {
            await adminCoursesAPI.updateCourse(id, data);
            await get().fetchCourseData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update course';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    },

    deleteCourse: async (id) => {
        set({ loading: true, error: null });
        try {
            await adminCoursesAPI.deleteCourse(id);
            await get().fetchCourseData();
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete course';
            set({ error: message, loading: false });
            return { success: false, message };
        }
    }
}));
