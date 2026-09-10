import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Add authentication token automatically.
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem("streamora_auth");

    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);

        if (parsedAuth?.token) {
          config.headers.Authorization = `Bearer ${parsedAuth.token}`;
        }
      } catch (error) {
        console.error(
          "Unable to read Streamora authentication:",
          error
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common API responses.
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("streamora:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;