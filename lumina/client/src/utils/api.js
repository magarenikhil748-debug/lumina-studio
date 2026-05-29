import axios from 'axios';

const runtimeApiUrl = `${window.location.protocol}//${window.location.hostname}:5000/api`;
export const API_URL = import.meta.env.VITE_API_URL || runtimeApiUrl;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';
    const skipRedirect = originalRequest?.skipAuthRedirect;
    const skipRefresh = originalRequest?.skipRefresh;

    if (!originalRequest || status !== 401 || originalRequest._retry || skipRefresh || url.includes('/auth/refresh') || url.includes('/auth/login')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      refreshPromise = refreshPromise || api.post('/auth/refresh', {}, { skipAuthRedirect: true });
      await refreshPromise;
      refreshPromise = null;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      window.dispatchEvent(new Event('lumina-auth-clear'));
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
  getMe: async (options = {}) => {
    const { data } = await api.get('/auth/me', options);
    return data;
  }
};

export const portfolioAPI = {
  getAll: async () => {
    const { data } = await api.get('/portfolios');
    return data.data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/portfolios/${id}`);
    return data.data;
  },
  create: async (portfolio) => {
    const { data } = await api.post('/portfolios', portfolio);
    return data.data;
  },
  update: async (id, portfolio) => {
    const { data } = await api.put(`/portfolios/${id}`, portfolio);
    return data.data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/portfolios/${id}`);
    return data;
  },
  getPublic: async (slug) => {
    const { data } = await api.get(`/portfolios/public/${slug}`, { skipAuthRedirect: true });
    return data.data;
  },
  getAnalytics: async (id, days = 30) => {
    const { data } = await api.get(`/portfolios/${id}/analytics`, { params: { days } });
    return data.data;
  },
  toggleVisibility: async (id) => {
    const { data } = await api.put(`/portfolios/${id}/visibility`);
    return data;
  },
  trackExport: async (slug) => {
    const { data } = await api.post(`/portfolios/public/${slug}/export`, {}, { skipAuthRedirect: true });
    return data.data;
  }
};

export const geminiAPI = {
  generate: async (payload) => {
    const { data } = await api.post('/gemini/generate', payload);
    return data.data;
  }
};

export const billingAPI = {
  plans: async () => {
    const { data } = await api.get('/billing/plans', { skipAuthRedirect: true });
    return data.data;
  },
  getPrices: async () => {
    const { data } = await api.get('/billing/prices', { skipAuthRedirect: true });
    return data;
  },
  getStatus: async () => {
    const { data } = await api.get('/billing/status');
    return data.data;
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
    return data.data;
  }
};

export const userAPI = {
  getPlan: async () => {
    const { data } = await api.get('/user/plan', { skipAuthRedirect: true });
    return data.data;
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
  return data.data;
};

export default api;
