import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
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