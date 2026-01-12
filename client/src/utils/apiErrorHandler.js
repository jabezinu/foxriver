/**
 * API Error Handler Utility
 * Standardizes error handling for API calls
 */

import { toast } from 'react-hot-toast';

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error) => {
    if (error.response) {
        // Server responded with error
        return error.response.data?.message || 'An error occurred';
    } else if (error.request) {
        // Request made but no response
        return 'No response from server. Please check your connection.';
    } else {
        // Error in request setup
        return error.message || 'An unexpected error occurred';
    }
};

/**
 * Handle API error with toast notification
 */
export const handleApiError = (error, customMessage = null) => {
    const message = customMessage || getErrorMessage(error);
    toast.error(message);
    
    // Log error in development
    if (import.meta.env.DEV) {
        console.error('API Error:', error);
    }
    
    return message;
};

/**
 * Handle API success with toast notification
 */
export const handleApiSuccess = (message = 'Success') => {
    toast.success(message);
};

/**
 * Retry failed API call
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error) => {
    return !error.response && error.request;
};

/**
 * Check if error is authentication error
 */
export const isAuthError = (error) => {
    return error.response?.status === 401;
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error) => {
    return error.response?.status === 400;
};
