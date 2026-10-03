import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const clientRoutes = [
      "/clients/portal",
      "/notes/client/shared",
      "/chat/history",
    ];

    const isClientRoute = clientRoutes.some((route) =>
      config.url?.startsWith(route)
    );

    const token = isClientRoute
      ? localStorage.getItem("unfazed_client_token")
      : localStorage.getItem("unfazed_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;