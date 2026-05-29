import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const normalizeUrl = (value) => String(value || '').trim().replace(/\/+$/, '');
const productionApiUrl = 'https://talented-wonder-production-bf61.up.railway.app/api';
const localApiUrl = `${window.location.protocol}//${window.location.hostname}:5000/api`;
const runtimeApiUrl = window.location.hostname.endsWith('vercel.app') ? productionApiUrl : localApiUrl;
export const API_URL = normalizeUrl(import.meta.env.VITE_API_URL || runtimeApiUrl);

const unwrapData = (payload) => payload?.data ?? payload;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;
const skipRetryRoutes = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/google'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const skipRedirect = originalRequest?.skipAuthRedirect;
    const skipRefresh = originalRequest?.skipRefresh;
    const isSkipRoute = skipRetryRoutes.some((route) => url.includes(route));

    if (!originalRequest || status !== 401 || originalRequest._retry || skipRefresh || isSkipRoute) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error('No refresh token available');

      refreshPromise = refreshPromise || axios.post(
        `${API_URL}/auth/refresh`,
        { refreshToken },
        {
          timeout: 30000,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const { data } = await refreshPromise;
      refreshPromise = null;
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      tokenStorage.clearTokens();
      window.dispatchEvent(new Event('lumina-auth-clear'));
      window.dispatchEvent(new Event('auth:logout'));
      if (!skipRedirect && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
      return Promise.reject(refreshError);
    }
  }
);

export const authAPI = {
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  logout: async () => {
    const { data } = await api.post('/auth/logout', {}, { skipAuthRedirect: true });
    return data;
  },
  refresh: async (refreshToken) => {
    const { data } = await api.post('/auth/refresh', { refreshToken }, { skipAuthRedirect: true });
    return data;
  },
  getMe: async (options = {}) => {
    const { data } = await api.get('/auth/me', options);
    return data;
  },
  googleLogin: () => {
    window.location.assign(`${API_URL}/auth/google`);
  }
};

export const portfolioAPI = {
  getAll: async () => {
    const { data } = await api.get('/portfolios');
    return unwrapData(data);
  },
  getById: async (id) => {
    const { data } = await api.get(`/portfolios/${id}`);
    return unwrapData(data);
  },
  create: async (portfolio) => {
    const { data } = await api.post('/portfolios', portfolio);
    return unwrapData(data);
  },
  update: async (id, portfolio) => {
    const { data } = await api.put(`/portfolios/${id}`, portfolio);
    return unwrapData(data);
  },
  delete: async (id) => {
    const { data } = await api.delete(`/portfolios/${id}`);
    return data;
  },
  getPublic: async (slug) => {
    const { data } = await api.get(`/portfolios/public/${slug}`, { skipAuthRedirect: true });
    return unwrapData(data);
  },
  getAnalytics: async (id, days = 30) => {
    const { data } = await api.get(`/portfolios/${id}/analytics`, { params: { days } });
    return unwrapData(data);
  },
  toggleVisibility: async (id) => {
    const { data } = await api.put(`/portfolios/${id}/visibility`);
    return data;
  },
  trackExport: async (slug) => {
    const { data } = await api.post(`/portfolios/public/${slug}/export`, {}, { skipAuthRedirect: true });
    return unwrapData(data);
  }
};

export const geminiAPI = {
  generate: async (payload) => {
    const { data } = await api.post('/gemini/generate', payload);
    return unwrapData(data);
  }
};

export const billingAPI = {
  plans: async () => {
    const { data } = await api.get('/billing/plans', { skipAuthRedirect: true });
    return unwrapData(data);
  },
  getPrices: async () => {
    const { data } = await api.get('/billing/prices', { skipAuthRedirect: true });
    return data;
  },
  getStatus: async () => {
    const { data } = await api.get('/billing/status');
    return unwrapData(data);
  },
  checkout: async (payload) => {
    const { data } = await api.post('/billing/checkout', payload);
    return data;
  },
  createCheckout: async (priceIdOrPayload) => {
    const payload = typeof priceIdOrPayload === 'string' ? { priceId: priceIdOrPayload } : priceIdOrPayload;
    const { data } = await api.post('/billing/checkout', payload);
    return data;
  },
  portal: async () => {
    const { data } = await api.post('/billing/portal');
    return data;
  },
  createPortal: async () => {
    const { data } = await api.post('/billing/portal');
    return data;
  },
  history: async () => {
    const { data } = await api.get('/billing/history');
    return unwrapData(data);
  }
};

export const userAPI = {
  getPlan: async () => {
    const { data } = await api.get('/user/plan', { skipAuthRedirect: true });
    return unwrapData(data);
  }
};

/**
 * Requests AI-generated portfolio recommendations.
 * @param {object} payload - Form data collected in the builder.
 * @returns {Promise<object>} Validated generation response.
 */
export const generatePortfolio = (payload) => geminiAPI.generate(payload);

/**
 * Persists a completed portfolio owned by the authenticated user.
 * @param {object} portfolio - Complete portfolio data.
 * @returns {Promise<object>} Saved portfolio document.
 */
export const savePortfolio = (portfolio) => portfolioAPI.create(portfolio);

/**
 * Updates an existing portfolio by id.
 * @param {string} id - Portfolio id.
 * @param {object} portfolio - Portfolio patch.
 * @returns {Promise<object>} Updated portfolio.
 */
export const updatePortfolio = (id, portfolio) => portfolioAPI.update(id, portfolio);

/**
 * Loads a public portfolio by slug.
 * @param {string} slug - Public portfolio slug.
 * @returns {Promise<object>} Portfolio document.
 */
export const fetchPortfolio = (slug) => portfolioAPI.getPublic(slug);

/**
 * Public portfolio views are counted by the public fetch endpoint.
 * @returns {Promise<object>} Empty tracking response.
 */
export const trackPortfolioView = async () => ({ tracked: true });

/**
 * Tracks a portfolio export event.
 * @param {string} slug - Public portfolio slug.
 * @returns {Promise<object>} Tracking response.
 */
export const trackPortfolioExport = (slug) => portfolioAPI.trackExport(slug);

/**
 * Captures a waitlist email for onboarding.
 * @param {{email: string, role?: string}} payload - Waitlist payload.
 * @returns {Promise<object>} Waitlist response.
 */
export const joinWaitlist = async (payload) => {
  const { data } = await api.post('/waitlist', payload);
  return unwrapData(data);
};

export default api;
