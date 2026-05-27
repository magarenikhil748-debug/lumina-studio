import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Eye, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
    toast.success('See you soon! 👋');
  };

  return (
    <motion.header
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 right-0 top-0 z-50 px-4 py-4"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/[0.08] bg-[rgba(255,255,255,0.05)] px-3 py-3 shadow-[0_0_40px_rgba(168,85,247,0.18)] backdrop-blur-md">
        <Link to="/" className="group flex items-center gap-3 text-lg font-extrabold">
          <span className="brand-mark" aria-hidden="true"><span>L</span></span>
          <span className="hidden text-white transition group-hover:text-[#c4b5fd] sm:inline">Lumina Studio</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-white/50">
          {!compact && <NavLink className="hidden rounded-full px-4 py-2 hover:bg-white/[0.05] hover:text-white sm:inline-flex" to="/">Home</NavLink>}
          {!compact && <NavLink className="hidden items-center gap-2 rounded-full px-4 py-2 hover:bg-white/[0.05] hover:text-white sm:inline-flex" to="/preview"><Eye className="h-4 w-4" /> Preview</NavLink>}
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
            <div ref={menuRef} className="relative">
              <button onClick={() => setOpen((current) => !current)} className="focus-ring flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] p-1 pr-3 text-white hover:bg-white/[0.08]" aria-expanded={open} aria-haspopup="menu">
                <img className="h-8 w-8 rounded-full border border-white/[0.12] object-cover" src={user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Lumina')}`} alt={`${user?.name || 'User'} avatar`} width="32" height="32" loading="lazy" />
                <span className="hidden max-w-28 truncate text-sm font-bold sm:inline">{user?.name}</span>
              </button>
              {open && (
                <motion.div
                  initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
                  className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/95 p-2 shadow-[0_0_40px_rgba(168,85,247,0.22)] backdrop-blur-xl"
                  role="menu"
                >
                  <div className="px-3 py-3">
                    <p className="truncate font-bold text-white">{user?.name}</p>
                    <p className="truncate text-sm text-white/45">{user?.email}</p>
                  </div>
                  <Link onClick={() => setOpen(false)} to="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white" role="menuitem"><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
                  <Link onClick={() => setOpen(false)} to="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white" role="menuitem"><UserRound className="h-4 w-4" />My Portfolios</Link>
                  <div className="my-2 h-px bg-white/[0.08]" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-semibold text-red-300 hover:bg-red-400/10" role="menuitem"><LogOut className="h-4 w-4" />Logout</button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

Navbar.propTypes = { compact: PropTypes.bool };

export default Navbar;
