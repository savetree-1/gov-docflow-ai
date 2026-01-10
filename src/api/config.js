import axios from "axios";
import { renewAccessToken } from "./authAPI";
const instance = axios.create({
  baseURL: "http://localhost:5001",
});

// Add token to every request automatically
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      const originalRequest = error.config;
      
      // Prevent infinite loop
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        const response = await renewAccessToken();
        const newToken = response.data?.accessToken || response.accessToken;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          originalRequest.headers["Authorization"] = "Bearer " + newToken;
          return axios.request(originalRequest);
        }
      } catch (refreshError) {
        // Just reject, don't auto-redirect
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
