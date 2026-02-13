import { create } from 'zustand';
import { taskAPI } from '../services/api';

export const useTaskStore = create((set, get) => ({
    tasks: [],
    dailyStats: { dailyIncome: 0, perVideoIncome: 0 },
    internRestriction: null,
    isSunday: false,
    earningsStats: null,
    loading: false,
    error: null,
    lastFetch: 0,
    isCompleting: false,

    isStale: (lastFetchTime, duration = 5 * 60 * 1000) => {
        return Date.now() - lastFetchTime > duration;
    },

    fetchTasks: async (force = false) => {
        const { lastFetch, loading, isStale, tasks } = get();

        if (!force && (loading || !isStale(lastFetch))) {
            return tasks;
        }

        set({ loading: true, error: null });

        try {
            const response = await taskAPI.getDailyTasks();
            const data = response.data;

            set({
                tasks: data.tasks,
                dailyStats: {
                    dailyIncome: data.dailyIncome,
                    perVideoIncome: data.perVideoIncome
                },
                internRestriction: data.internRestriction,
                isSunday: data.isSunday || false,
                earningsStats: data.earningsStats || null,
                lastFetch: Date.now(),
                loading: false
            });
            return data.tasks;
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            set({
                loading: false,
                error: 'Failed to fetch tasks'
            });
            return tasks;
        }
    },

    completeTask: async (taskId) => {
        set({ isCompleting: true, error: null });

        try {
            const response = await taskAPI.completeTask(taskId);

            if (response.data.success) {
                // Update task completion status optimistically
                set(state => ({
                    tasks: state.tasks.map(t =>
                        t._id === taskId
                            ? { ...t, isCompleted: true }
                            : t
                    ),
                    isCompleting: false
                }));

                return {
                    success: true,
                    earningsAmount: response.data.earningsAmount,
                    message: response.data.message
                };
            }
        } catch (error) {
            console.error('Failed to complete task:', error);
            set({
                isCompleting: false,
                error: error.response?.data?.message || 'Failed to complete task'
            });
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to complete task'
            };
        }
    },

    invalidateCache: () => {
        set({ lastFetch: 0 });
    },

    reset: () => {
        set({
            tasks: [],
            dailyStats: { dailyIncome: 0, perVideoIncome: 0 },
            internRestriction: null,
            isSunday: false,
            earningsStats: null,
            loading: false,
            error: null,
            lastFetch: 0,
            isCompleting: false
        });
    }
}));
