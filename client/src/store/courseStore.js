import { create } from 'zustand';
import { coursesAPI } from '../services/api';

export const useCourseStore = create((set, get) => ({
    categories: [],
    courses: {}, // categoryId -> courses[]
    loading: {
        categories: false,
        courses: {} // categoryId -> loading
    },
    error: null,

    fetchCategories: async (force = false) => {
        const { loading, categories } = get();
        if (loading.categories && !force) return categories;

        set(state => ({ loading: { ...state.loading, categories: true }, error: null }));
        try {
            const response = await coursesAPI.getCategories();
            const data = response.data || [];
            set(state => ({ categories: data, loading: { ...state.loading, categories: false } }));
            return data;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            set(state => ({ loading: { ...state.loading, categories: false }, error: 'Failed to load categories' }));
            return categories;
        }
    },

    fetchCoursesByCategory: async (categoryId) => {
        const { loading } = get();
        if (loading.courses[categoryId]) return;

        set(state => ({
            loading: {
                ...state.loading,
                courses: { ...state.loading.courses, [categoryId]: true }
            },
            error: null
        }));

        try {
            const response = await coursesAPI.getCoursesByCategory(categoryId);
            const data = response.data || [];
            set(state => ({
                courses: { ...state.courses, [categoryId]: data },
                loading: {
                    ...state.loading,
                    courses: { ...state.loading.courses, [categoryId]: false }
                }
            }));
            return data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            set(state => ({
                loading: {
                    ...state.loading,
                    courses: { ...state.loading.courses, [categoryId]: false }
                }
            }));
            return [];
        }
    },

    reset: () => {
        set({
            categories: [],
            courses: {},
            loading: {
                categories: false,
                courses: {}
            },
            error: null
        });
    }
}));
