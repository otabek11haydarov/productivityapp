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
            // Unauthorized, maybe clear user state here or redirect
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
