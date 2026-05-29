import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  useEffect(() => {
    let active = true;
    const completeOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') || params.get('success') !== 'true') {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }

      const user = await checkSession();
      if (!active) return;
      if (!user) {
        navigate('/login?error=session_failed', { replace: true });
        return;
      }

      window.history.replaceState({}, document.title, '/auth/callback');
      const redirectTo = sessionStorage.getItem('oauth_redirect') || '/dashboard';
      sessionStorage.removeItem('oauth_redirect');
      navigate(redirectTo, { replace: true });
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
