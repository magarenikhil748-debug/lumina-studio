const ACCESS_TOKEN_KEY = 'lumina_access_token';
const REFRESH_TOKEN_KEY = 'lumina_refresh_token';

const storage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

/**
 * Reads and writes auth tokens for cross-domain production deployments.
 * Vercel and Railway do not share a parent domain, so API requests authenticate
 * with Authorization headers instead of browser cookies.
 */
export const tokenStorage = {
  getAccessToken: () => storage()?.getItem(ACCESS_TOKEN_KEY) || null,

  getRefreshToken: () => storage()?.getItem(REFRESH_TOKEN_KEY) || null,

  setTokens: (accessToken, refreshToken) => {
    const localStorage = storage();
    if (!localStorage || !accessToken) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: () => {
    const localStorage = storage();
    if (!localStorage) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens: () => Boolean(storage()?.getItem(ACCESS_TOKEN_KEY))
};

export default tokenStorage;
