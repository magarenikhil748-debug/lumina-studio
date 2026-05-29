import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'CLEAR_USER':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const authActionVersion = useRef(0);
  const navigate = useNavigate();

  const checkSession = useCallback(async ({ skipLoading = false } = {}) => {
    if (!tokenStorage.hasTokens()) {
      dispatch({ type: 'CLEAR_USER' });
      return null;
    }

    const requestVersion = authActionVersion.current;
    if (!skipLoading) dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await authAPI.getMe({ skipAuthRedirect: true });
      if (requestVersion === authActionVersion.current) {
        dispatch({ type: 'SET_USER', payload: response.user });
        return response.user;
      }
      return null;
    } catch (error) {
      if (requestVersion === authActionVersion.current) {
        tokenStorage.clearTokens();
        dispatch({ type: 'CLEAR_USER' });
      }
      return null;
    } finally {
      if (requestVersion === authActionVersion.current) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, []);

  const handleForcedLogout = useCallback(() => {
    authActionVersion.current += 1;
    tokenStorage.clearTokens();
    dispatch({ type: 'CLEAR_USER' });
    if (window.location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('lumina-auth-clear', handleForcedLogout);
    window.addEventListener('auth:logout', handleForcedLogout);
    return () => {
      window.removeEventListener('lumina-auth-clear', handleForcedLogout);
      window.removeEventListener('auth:logout', handleForcedLogout);
    };
  }, [handleForcedLogout]);

  useEffect(() => {
    let active = true;
    const runCheck = async () => {
      if (!tokenStorage.hasTokens()) {
        if (active) dispatch({ type: 'CLEAR_USER' });
        return;
      }
      if (active) await checkSession();
    };
    runCheck();
    return () => {
      active = false;
    };
  }, [checkSession]);

  const login = useCallback(async (email, password) => {
    try {
      authActionVersion.current += 1;
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login({ email, password });
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      dispatch({ type: 'SET_USER', payload: response.user });
      return response.user;
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Could not sign in';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      authActionVersion.current += 1;
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register({ name, email, password });
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      dispatch({ type: 'SET_USER', payload: response.user });
      return response.user;
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Could not create account';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    authActionVersion.current += 1;
    sessionStorage.setItem('lumina-logging-out', '1');
    try {
      await authAPI.logout();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: null });
    } finally {
      tokenStorage.clearTokens();
      dispatch({ type: 'CLEAR_USER' });
      navigate('/', { replace: true });
      window.setTimeout(() => sessionStorage.removeItem('lumina-logging-out'), 900);
    }
  }, [navigate]);

  const loginWithGoogle = useCallback(() => {
    if (window.location.pathname !== '/login') {
      sessionStorage.setItem('oauth_redirect', `${window.location.pathname}${window.location.search}`);
    }
    authAPI.googleLogin();
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    loginWithGoogle,
    checkSession
  }), [checkSession, login, loginWithGoogle, logout, register, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
