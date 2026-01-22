import axios from 'axios';

// Backend API Base URL - Local
const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token and user ID
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user.id) {
                    config.headers['X-User-Id'] = user.id.toString();
                }
            } catch (e) {
                console.error('Error parsing user from localStorage', e);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Check if it's not the login request failing
            if (!error.config.url?.endsWith('/login')) {
                window.dispatchEvent(new CustomEvent('auth-session-expired'));
            }
        }
        return Promise.reject(error);
    }
);

export default api;
