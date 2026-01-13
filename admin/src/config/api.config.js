/**
 * API Configuration
 * Central place for all API-related configuration
 */

export const API_CONFIG = {
  // baseURL: 'http://localhost:5002/api',
  baseURL: 'https://everest-db.kalgemstones.com/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Get the base API URL (with /api)
 */
export const getApiUrl = () => API_CONFIG.baseURL;

/**
 * Get the server base URL (without /api)
 * Useful for accessing uploaded files, images, etc.
 */
export const getServerUrl = () => API_CONFIG.baseURL.replace(/\/api$/, '');

export default API_CONFIG;
