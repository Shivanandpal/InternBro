import axios from "axios";

const api = axios.create({
    baseURL: "https://internbro.onrender.com",
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Auto-clear stale tokens (e.g. from a previous session on a different server)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired — clear it so login page shows
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export default api;