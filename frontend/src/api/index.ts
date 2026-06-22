import axios from 'axios';

console.log('VITE_API_URL=', import.meta.env.VITE_API_URL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // For sending cookies
});

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[Axios Interceptor] 401 Unauthorized received. Clearing session state.');
            localStorage.removeItem('isAuthenticated');
            // If we are not already on the login page, redirect
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
