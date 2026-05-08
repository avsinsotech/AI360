// Pulls API URL from environment variables, or falls back to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default API_BASE_URL;

