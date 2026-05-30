import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const BuildPage = lazy(() => import('./pages/BuildPage'));
const PreviewPage = lazy(() => import('./pages/PreviewPage'));
const PublicPortfolioPage = lazy(() => import('./pages/PublicPortfolioPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const BillingSuccessPage = lazy(() => import('./pages/BillingSuccessPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const InnerPageShell = ({ children }) => (
  <>
    <div className="lumina-ambient" />
    <div className="lumina-noise" />
    {children}
  </>
);

InnerPageShell.propTypes = {
  children: PropTypes.node.isRequired
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<main className="min-h-screen bg-ink p-4"><LoadingScreen /></main>}>
          <Routes location={location}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<InnerPageShell><LoginPage /></InnerPageShell>} />
            <Route path="/auth/callback" element={<InnerPageShell><OAuthCallbackPage /></InnerPageShell>} />
            <Route path="/build" element={<InnerPageShell><BuildPage /></InnerPageShell>} />
            <Route path="/preview" element={<InnerPageShell><PreviewPage /></InnerPageShell>} />
            <Route path="/pricing" element={<InnerPageShell><PricingPage /></InnerPageShell>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<InnerPageShell><DashboardPage /></InnerPageShell>} />
              <Route path="/dashboard/billing" element={<InnerPageShell><BillingPage /></InnerPageShell>} />
              <Route path="/dashboard/billing/success" element={<InnerPageShell><BillingSuccessPage /></InnerPageShell>} />
            </Route>
            <Route path="/p/:slug" element={<PublicPortfolioPage />} />
            <Route path="*" element={<InnerPageShell><NotFoundPage /></InnerPageShell>} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(18px)' } }} />
      <AnimatedRoutes />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
