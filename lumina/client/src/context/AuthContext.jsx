import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, authAPI } from '../utils/api';

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
  const navigate = useNavigate();

  useEffect(() => {
    const clearUser = () => dispatch({ type: 'CLEAR_USER' });
    window.addEventListener('lumina-auth-clear', clearUser);
    return () => window.removeEventListener('lumina-auth-clear', clearUser);
  }, []);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await authAPI.getMe({ skipAuthRedirect: true, skipRefresh: true });
        if (active) dispatch({ type: 'SET_USER', payload: response.user });
      } catch (error) {
        if (active) dispatch({ type: 'CLEAR_USER' });
      } finally {
        if (active) dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    checkSession();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({
    ...state,
    login: async (email, password) => {
      try {
        const response = await authAPI.login({ email, password });
        dispatch({ type: 'SET_USER', payload: response.user });
        return response.user;
      } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.error || 'Could not sign in';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw new Error(message);
      }
    },
    register: async (name, email, password) => {
      try {
        const response = await authAPI.register({ name, email, password });
        dispatch({ type: 'SET_USER', payload: response.user });
        return response.user;
      } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.error || 'Could not create account';
        dispatch({ type: 'SET_ERROR', payload: message });
        throw new Error(message);
      }
    },
    logout: async () => {
      sessionStorage.setItem('lumina-logging-out', '1');
      try {
        await authAPI.logout();
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: null });
      } finally {
        navigate('/', { replace: true });
        window.setTimeout(() => dispatch({ type: 'CLEAR_USER' }), 0);
        window.setTimeout(() => sessionStorage.removeItem('lumina-logging-out'), 900);
      }
    },
    loginWithGoogle: () => {
      window.location.assign(`${API_URL}/auth/google`);
    }
  }), [navigate, state]);

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
