import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import router from "@/router";

const baseUrl = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  const locale = localStorage.getItem("locale") || "en";
  const authStore = useAuthStore();
  config.withCredentials = false;

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  } else {
    authStore.logout();
    router.push("/login");
  }

  config.headers["Accept-Language"] = locale;
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // always return response.data directly
    return response.data;
  },
  (error) => {
    const authStore = useAuthStore();
    if (error.response?.status === 401 || error.response?.status === 422) {
      authStore.logout();
      router.push("/login");
    }

    // if backend returns structured error response, unwrap and pass
    if (error.response?.data) {
      return Promise.reject(error.response.data);
    }

    // if no backend response (network error etc)
    return Promise.reject(error);
  }
);

export default axiosInstance;
