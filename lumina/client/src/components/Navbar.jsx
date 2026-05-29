import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, ChevronDown, CreditCard, Eye, LayoutDashboard, LogOut, Sparkles, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import TierBadge from './TierBadge';

const Navbar = ({ compact = false }) => {
  const reduceMotion = useReducedMotion();
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('See you soon.');
  };

  const initials = (user?.name || 'Lumina User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const avatarUrl = user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Lumina')}`;
  const isStarter = (user?.plan || (user?.tier === 'free' ? 'starter' : user?.tier)) === 'starter';

  return (
    <motion.header
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-50 px-4 py-4"
    >
      <nav className="mx-auto flex min-h-[80px] max-w-6xl items-center justify-between gap-4 rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-3 py-3 shadow-[0_0_40px_rgba(168,85,247,0.18)] backdrop-blur-md sm:px-4">
        <Link to="/" className="group flex min-w-0 shrink-0 items-center gap-3 text-lg font-extrabold">
          <span className="brand-mark" aria-hidden="true"><span>L</span></span>
          <span className="hidden text-white transition group-hover:text-[#c4b5fd] sm:inline">Lumina Studio</span>
        </Link>
        <div className="flex min-w-0 items-center gap-2 text-sm text-white/50">
          {!compact && <NavLink className="hidden rounded-full px-4 py-2 hover:bg-white/[0.05] hover:text-white sm:inline-flex" to="/">Home</NavLink>}
          {!compact && <NavLink className="hidden items-center gap-2 rounded-full px-4 py-2 hover:bg-white/[0.05] hover:text-white sm:inline-flex" to="/preview"><Eye className="h-4 w-4" /> Preview</NavLink>}
          {!compact && <NavLink className="hidden items-center gap-2 rounded-full px-4 py-2 hover:bg-white/[0.05] hover:text-white md:inline-flex" to="/pricing"><CreditCard className="h-4 w-4" /> Pricing</NavLink>}
          {!compact && isAuthenticated && <NavLink className="hidden rounded-full px-4 py-2 hover:bg-white/[0.05] hover:text-white md:inline-flex" to="/dashboard">Dashboard</NavLink>}

          {!isAuthenticated ? (
            <>
              <NavLink className="hidden rounded-full px-4 py-2 font-semibold text-white/70 hover:bg-white/[0.05] hover:text-white sm:inline-flex" to="/login">Sign In</NavLink>
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              >
                <NavLink className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold" to="/build">
                  Build Free <ArrowRight className="h-4 w-4" />
                </NavLink>
              </motion.div>
            </>
          ) : (
            <div ref={menuRef} className="relative flex shrink-0 items-center gap-2">
              {isStarter && (
                <Link to="/pricing" className="hidden h-11 items-center rounded-full border border-[#c4b5fd]/20 bg-[#a855f7]/14 px-4 text-sm font-black text-[#e9d5ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-[#a855f7]/22 hover:text-white md:inline-flex">
                  Upgrade
                </Link>
              )}
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="focus-ring inline-flex h-11 max-w-[190px] items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.055] p-1 pr-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:border-white/[0.14] hover:bg-white/[0.09]"
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="Open account menu"
              >
                <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#c4b5fd]/30 bg-[#6d42d8] text-sm font-black text-white shadow-[0_0_18px_rgba(124,58,237,0.28)]">
                  <img className="absolute inset-0 h-full w-full rounded-full object-cover" src={avatarUrl} alt="" width="36" height="36" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                  <span aria-hidden="true">{initials || 'L'}</span>
                </span>
                <span className="hidden min-w-0 max-w-[104px] truncate text-sm font-black sm:inline">{user?.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-white/45 transition ${open ? 'rotate-180 text-white/70' : ''}`} />
              </button>
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-full mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0b0b12]/95 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.42),0_0_44px_rgba(124,58,237,0.18)] backdrop-blur-2xl"
                    role="menu"
                  >
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[#c4b5fd]/25 bg-[#6d42d8] text-sm font-black text-white">
                          <img className="absolute inset-0 h-full w-full rounded-full object-cover" src={avatarUrl} alt="" width="44" height="44" loading="lazy" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
                          <span className="relative">{initials || 'L'}</span>
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black text-white">{user?.name}</p>
                          <p className="truncate text-sm text-white/45">{user?.email}</p>
                        </div>
                        <TierBadge
                          compact
                          plan={user?.plan}
                          subscriptionStatus={user?.subscriptionStatus}
                          trialEndsAt={user?.trialEndsAt}
                          inGracePeriod={user?.inGracePeriod}
                          gracePeriodEndsAt={user?.gracePeriodEndsAt}
                        />
                      </div>
                    </div>
                    <div className="mt-2 grid gap-1">
                      <Link onClick={() => setOpen(false)} to="/dashboard" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold text-white/72 transition hover:bg-white/[0.06] hover:text-white" role="menuitem"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
                      <Link onClick={() => setOpen(false)} to="/dashboard" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold text-white/72 transition hover:bg-white/[0.06] hover:text-white" role="menuitem"><UserRound className="h-4 w-4" />My Portfolios</Link>
                      <Link onClick={() => setOpen(false)} to="/dashboard/billing" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 font-semibold text-white/72 transition hover:bg-white/[0.06] hover:text-white" role="menuitem"><Sparkles className="h-4 w-4" />Plans & Billing</Link>
                      <div className="my-1 h-px bg-white/[0.08]" />
                      <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left font-semibold text-red-300 transition hover:bg-red-400/10 hover:text-red-200" role="menuitem"><LogOut className="h-4 w-4" />Logout</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

Navbar.propTypes = { compact: PropTypes.bool };

export default Navbar;
