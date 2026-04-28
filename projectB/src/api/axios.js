import axios from 'axios';

// To this (using environment variables):
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/'
});

// The "Interceptor": It acts like a post office that adds a stamp to every letter
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // This matches the 'Bearer' type we set up in Django settings
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;