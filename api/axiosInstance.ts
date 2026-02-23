import axios from 'axios';

if (!import.meta.env.VITE_API_URL) {
  console.error('VITE_API_URL is not defined. Check your .env file.');
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

export const setupInterceptors = (
  clearAuth: () => void,
  navigate?: (path: string) => void,
  showToast?: (msg: string) => void
) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          clearAuth();
          if (navigate) navigate('/');
        } else if (status === 403) {
          if (navigate) navigate('/unauthorized');
        } else if (status >= 500) {
          if (showToast) showToast('Server error. Try again later.');
        }
      } else if (error.request) {
        // No response received — network issue
        if (showToast) showToast('Connection lost. Check your internet.');
      }

      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
