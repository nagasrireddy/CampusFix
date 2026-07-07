// ---------------------------------------------------------
// api/axiosInstance.js
// Pre-configured Axios instance. A request interceptor attaches
// the current session's JWT (read via the namespaced storage
// module, never raw localStorage) and a response interceptor
// forces a clean logout if the backend reports the token as
// invalid/expired, preventing the UI from getting stuck in a
// half-authenticated state.
// ---------------------------------------------------------

import axios from 'axios';
import { getSession, clearSession } from '../utils/storage';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Token invalid/expired - purge local session and force re-login.
      clearSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
