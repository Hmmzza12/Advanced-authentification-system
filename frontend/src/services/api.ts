import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle Token Refresh
api.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== "/auth/login" && !originalConfig.url.includes("/2fa/authenticate") && err.response) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {
                    const rs = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken: localStorage.getItem("refreshToken"),
                    });

                    const { token, refreshToken } = rs.data;

                    localStorage.setItem("token", token);
                    localStorage.setItem("refreshToken", refreshToken);

                    return api(originalConfig);
                } catch (_error) {
                    // Refresh token failed, force logout
                    localStorage.removeItem("token");
                    localStorage.removeItem("refreshToken");
                    localStorage.removeItem("user");
                    window.location.href = "/login?expired=true";
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);

export default api;
