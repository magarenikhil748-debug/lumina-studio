import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const isLoggingOut = sessionStorage.getItem('lumina-logging-out') === '1';
    if (!isLoading && !isAuthenticated && !isLoggingOut) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <main className="min-h-screen bg-ink p-4"><LoadingScreen /></main>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
