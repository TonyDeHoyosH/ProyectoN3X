import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL + '/api',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (email: string, password: string) => api.post('/auth/register', { email, password }),
    logout: () => api.post('/auth/logout'),
};

export const reposService = {
    search: (query: string, sort: string = 'stars', per_page: number = 10, page: number = 1) => 
        api.post('/repos/search', { query, sort, per_page, page })
};

export default api;
