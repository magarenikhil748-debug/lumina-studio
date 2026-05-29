import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const nameRegex = /^[A-Za-z][A-Za-z\s-]{1,99}$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const sanitize = (value) => String(value || '').replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
});

const registerSchema = z.object({
  name: z.string().transform(sanitize).refine((value) => nameRegex.test(value), 'Use 2-100 letters, spaces, or hyphens'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().refine((value) => passwordRegex.test(value), 'Use 8+ chars with uppercase, number, and special character'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(Boolean, 'Accept the terms to continue')
}).refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords must match'
});

const strengthLevels = [
  { label: 'Weak', color: 'bg-red-400', score: 1 },
  { label: 'Fair', color: 'bg-amber-300', score: 2 },
  { label: 'Good', color: 'bg-blue-300', score: 3 },
  { label: 'Strong', color: 'bg-[#a855f7]', score: 4 }
];

const googleErrorMessages = {
  google_client_config: 'Google sign in needs a production OAuth config update. Email sign in still works.',
  redirect_uri_mismatch: 'Google rejected the callback URL. Check the authorized redirect URI in Google Cloud.',
  stale_google_code: 'That Google sign in link expired. Please try again.',
  access_denied: 'Google sign in was cancelled.',
  no_google_user: 'Google did not return a usable account. Please try another Google account.',
  google_exchange_failed: 'Google could not complete sign in. Please try again or use email sign in.'
};

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
  </svg>
);

const PasswordField = ({ register, error, label = 'Password', autoComplete }) => {
  const [visible, setVisible] = useState(false);
  return (
    <label className="grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <span className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          {...register}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/70 py-3 pl-11 pr-12 text-white"
        />
        <button type="button" onClick={() => setVisible((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error && <span className="text-xs text-red-300">{error.message}</span>}
    </label>
  );
};

PasswordField.propTypes = {
  register: PropTypes.object.isRequired,
  error: PropTypes.shape({ message: PropTypes.string }),
  label: PropTypes.string,
  autoComplete: PropTypes.string
};

const LoginPage = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login, loginWithGoogle, register: registerUser } = useAuth();
  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get('mode') === 'create' ? 'create' : 'signin');
  const from = location.state?.from || '/dashboard';

  const loginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const registerForm = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false } });
  const watchedPassword = registerForm.watch('password');

  const strength = useMemo(() => {
    const checks = [
      watchedPassword?.length >= 8,
      /[A-Z]/.test(watchedPassword || ''),
      /\d/.test(watchedPassword || ''),
      /[@$!%*?&]/.test(watchedPassword || '')
    ].filter(Boolean).length;
    return strengthLevels[Math.max(0, checks - 1)] || strengthLevels[0];
  }, [watchedPassword]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate(from === '/login' ? '/dashboard' : from, { replace: true });
  }, [from, isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const reason = params.get('reason');
    if (error === 'oauth_failed') toast.error(googleErrorMessages[reason] || 'Google sign in failed. Please try again.');
    if (error === 'session_failed') toast.error('Your Google sign in completed, but the session could not be restored.');
  }, [location.search]);

  const submitLogin = loginForm.handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  });

  const submitRegister = registerForm.handleSubmit(async (values) => {
    try {
      await registerUser(values.name, values.email, values.password);
      toast.success('Welcome to Lumina.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  });

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-28 text-white">
      <AnimatedBackground />
      <Navbar compact />
      <motion.section
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-md rounded-2xl border border-white/[0.08] bg-[rgba(255,255,255,0.05)] p-5 shadow-[0_0_40px_rgba(168,85,247,0.18)] backdrop-blur-xl sm:p-7"
      >
        <Link to="/" className="mb-6 flex items-center justify-center gap-3 text-lg font-extrabold">
          <span className="brand-mark" aria-hidden="true"><span>L</span></span>
          <span>Lumina Studio</span>
        </Link>

        <div className="relative mb-7 grid grid-cols-2 rounded-full border border-white/[0.08] bg-[#0a0a0f]/70 p-1">
          <motion.span
            layout
            className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-white/[0.08]"
            animate={{ x: activeTab === 'signin' ? 0 : '100%' }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
          />
          {[
            ['signin', 'Sign In'],
            ['create', 'Create Account']
          ].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} className={`relative z-10 rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === id ? 'text-white' : 'text-white/45'}`}>
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'signin' ? (
            <motion.form key="signin" onSubmit={submitLogin} initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 18 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.24 }} className="space-y-4">
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Email
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input {...loginForm.register('email')} autoComplete="email" className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/70 py-3 pl-11 pr-4 text-white" />
                </span>
                {loginForm.formState.errors.email && <span className="text-xs text-red-300">{loginForm.formState.errors.email.message}</span>}
              </label>
              <PasswordField register={loginForm.register('password')} error={loginForm.formState.errors.password} autoComplete="current-password" />
              <button type="button" onClick={() => toast('Coming soon')} className="text-sm font-semibold text-[#c4b5fd] hover:text-white">Forgot password?</button>
              <button disabled={loginForm.formState.isSubmitting} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bold disabled:opacity-50">
                {loginForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Sign In
              </button>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/35"><span className="h-px flex-1 bg-white/[0.08]" />or<span className="h-px flex-1 bg-white/[0.08]" /></div>
              <button type="button" onClick={loginWithGoogle} className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 font-bold text-white hover:bg-white/[0.08]">
                <GoogleIcon /> Continue with Google
              </button>
            </motion.form>
          ) : (
            <motion.form key="create" onSubmit={submitRegister} initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -18 }} transition={reduceMotion ? { duration: 0 } : { duration: 0.24 }} className="space-y-4">
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Name
                <span className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input {...registerForm.register('name')} autoComplete="name" className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/70 py-3 pl-11 pr-4 text-white" />
                </span>
                {registerForm.formState.errors.name && <span className="text-xs text-red-300">{registerForm.formState.errors.name.message}</span>}
              </label>
              <label className="grid gap-2 text-sm font-semibold text-white/80">
                Email
                <span className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input {...registerForm.register('email')} autoComplete="email" className="focus-ring w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/70 py-3 pl-11 pr-4 text-white" />
                </span>
                {registerForm.formState.errors.email && <span className="text-xs text-red-300">{registerForm.formState.errors.email.message}</span>}
              </label>
              <PasswordField register={registerForm.register('password')} error={registerForm.formState.errors.password} autoComplete="new-password" />
              <div className="grid gap-2">
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className={`h-full ${strength.color}`} style={{ width: `${strength.score * 25}%` }} />
                </div>
                <span className="text-xs text-white/45">Password strength: {strength.label}</span>
              </div>
              <PasswordField register={registerForm.register('confirmPassword')} error={registerForm.formState.errors.confirmPassword} label="Confirm Password" autoComplete="new-password" />
              <label className="flex items-start gap-3 text-sm text-white/60">
                <input type="checkbox" {...registerForm.register('terms')} className="mt-1 accent-[#a855f7]" />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </label>
              {registerForm.formState.errors.terms && <span className="block text-xs text-red-300">{registerForm.formState.errors.terms.message}</span>}
              <button disabled={registerForm.formState.isSubmitting} className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 font-bold disabled:opacity-50">
                {registerForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
              </button>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/35"><span className="h-px flex-1 bg-white/[0.08]" />or<span className="h-px flex-1 bg-white/[0.08]" /></div>
              <button type="button" onClick={loginWithGoogle} className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-3 font-bold text-white hover:bg-white/[0.08]">
                <GoogleIcon /> Continue with Google
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
};

export default LoginPage;
