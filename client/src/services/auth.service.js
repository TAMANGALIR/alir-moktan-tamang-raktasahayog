import apiClient from './api.service';

const authService = {
    async register(userData) {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    async verifyOtp(data) {
        const response = await apiClient.post('/auth/verify-otp', data);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async resendOtp(data) {
        const response = await apiClient.post('/auth/resend-otp', data);
        return response.data;
    },

    async login(credentials) {
        const response = await apiClient.post('/auth/login', credentials);
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken() {
        return localStorage.getItem('accessToken');
    },

    isAuthenticated() {
        return !!this.getToken();
    },
};

export default authService;
