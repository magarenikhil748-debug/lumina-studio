import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { tokenStorage } from '../utils/tokenStorage';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  useEffect(() => {
    let active = true;

    const completeOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');

      if (params.get('error') || !accessToken || !refreshToken) {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }

      try {
        tokenStorage.setTokens(accessToken, refreshToken);
        window.history.replaceState({}, document.title, '/auth/callback');

        const user = await checkSession();
        if (!active) return;
        if (!user) {
          tokenStorage.clearTokens();
          navigate('/login?error=session_failed', { replace: true });
          return;
        }

        const redirectTo = sessionStorage.getItem('oauth_redirect') || '/dashboard';
        sessionStorage.removeItem('oauth_redirect');
        navigate(redirectTo, { replace: true });
      } catch (error) {
        tokenStorage.clearTokens();
        if (active) navigate('/login?error=session_failed', { replace: true });
      }
    };

    completeOAuth();
    return () => {
      active = false;
    };
  }, [checkSession, navigate]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] p-4 text-white">
      <LoadingScreen message="Completing sign in" detail="Securing your Lumina session and opening your dashboard." />
    </main>
  );
};

export default OAuthCallbackPage;
