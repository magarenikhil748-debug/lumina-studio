import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import {
  CreditCard,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Wand2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import usePlan from '../hooks/usePlan';
import LuminaLogo from './LuminaLogo';
import TierBadge from './TierBadge';

const normalizePlan = (value) => {
  if (!value || value === 'free') return 'starter';
  return value;
};

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/build', label: 'Build' },
  { href: '/preview', label: 'Preview' },
  { href: '/pricing', label: 'Pricing' }
];

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Wand2, label: 'Build Portfolio', href: '/build' },
  { icon: Eye, label: 'Preview', href: '/preview' },
  { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
  { icon: Settings, label: 'Settings', href: '/dashboard' }
];

export default function Navbar({ compact = false }) {
  const { user, isAuthenticated, logout } = useAuth();
  const planState = usePlan();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();
  const currentPlan = normalizePlan(planState.plan || user?.plan || user?.tier);

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 80));

  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const glassVisible = !isLandingPage || scrolled;
  const navBackground = glassVisible ? 'rgba(7,7,15,0.72)' : 'rgba(7,7,15,0)';
  const navBlur = glassVisible ? 'blur(24px)' : 'blur(0px)';
  const navBorder = glassVisible ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(255,255,255,0)';

  return (
    <>
      <motion.nav
        animate={{
          backgroundColor: navBackground,
          backdropFilter: navBlur,
          WebkitBackdropFilter: navBlur
        }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          zIndex: 1000,
          borderBottom: navBorder,
          transition: 'border-color 0.4s ease'
        }}
      >
        <div
          style={{
            maxWidth: compact ? '1180px' : '1200px',
            margin: '0 auto',
            padding: '0 24px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            position: 'relative'
          }}
        >
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <LuminaLogo size={32} showGlow={false} />
              <span
                className="lumina-wordmark"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff',
                  letterSpacing: '0'
                }}
              >
                Lumina Studio
              </span>
            </motion.div>
          </Link>

          <div
            className="lumina-desktop-nav"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ color: 'rgba(255,255,255,0.85)' }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: isActive(link.href) ? 600 : 450,
                    color: isActive(link.href) ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    background: 'transparent',
                    transition: 'color 0.2s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="navActiveDot"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        background: '#a855f7'
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {!isAuthenticated ? (
              <div className="lumina-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <motion.span
                    whileHover={{ color: '#ffffff' }}
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.55)',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Sign In
                  </motion.span>
                </Link>
                <Link to="/login?tab=register" style={{ textDecoration: 'none' }}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(168,85,247,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                      border: 'none',
                      borderRadius: '999px',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '8px 18px',
                      boxShadow: '0 0 16px rgba(168,85,247,0.3)',
                      fontFamily: 'inherit',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <motion.button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  whileHover={{ boxShadow: '0 0 20px rgba(168,85,247,0.5)', scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #3b82f6, #a855f7)',
                    padding: '1.5px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'box-shadow 0.2s ease'
                  }}
                  aria-label="Open account menu"
                  aria-expanded={dropdownOpen}
                >
                  <span
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a0a2e, #0d0d1a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    {user?.avatar && !user.avatar.includes('dicebear') ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'Account'}
                        width="31"
                        height="31"
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0' }}>
                        {getInitials(user?.name)}
                      </span>
                    )}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: '230px',
                        background: 'rgba(10,10,20,0.97)',
                        backdropFilter: 'blur(32px)',
                        WebkitBackdropFilter: 'blur(32px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), 0 0 40px rgba(168,85,247,0.08)',
                        overflow: 'hidden',
                        zIndex: 1001
                      }}
                    >
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{user?.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                        <div style={{ marginTop: '8px' }}>
                          <TierBadge
                            plan={currentPlan}
                            subscriptionStatus={planState.subscriptionStatus}
                            isOnTrial={planState.isTrialing}
                            trialEndsAt={planState.trialEndsAt}
                            inGracePeriod={planState.inGracePeriod}
                            gracePeriodEndsAt={planState.gracePeriodEndsAt}
                            size="sm"
                          />
                        </div>
                      </div>
                      {menuItems.map((item) => (
                        <Link key={item.href} to={item.href} style={{ textDecoration: 'none' }}>
                          <motion.div
                            whileHover={{ background: 'rgba(255,255,255,0.05)', x: 2 }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 16px',
                              color: 'rgba(255,255,255,0.72)',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <item.icon size={14} />
                            {item.label}
                          </motion.div>
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <motion.button
                          type="button"
                          onClick={logout}
                          whileHover={{ background: 'rgba(239,68,68,0.08)' }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 16px',
                            color: '#f87171',
                            fontSize: '13px',
                            fontWeight: 650,
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none'
                          }}
                        >
                          <LogOut size={14} />
                          Sign Out
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              whileTap={{ scale: 0.9 }}
              className="lumina-mobile-btn"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.72)',
                display: 'none',
                padding: '4px'
              }}
              aria-label="Open navigation"
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={20} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              background: 'rgba(7,7,15,0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              zIndex: 999,
              padding: '16px 24px 24px'
            }}
          >
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Link to={link.href} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      padding: '14px 0',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: isActive(link.href) ? '#c084fc' : 'rgba(255,255,255,0.72)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)'
                    }}
                  >
                    {link.label}
                  </div>
                </Link>
              </motion.div>
            ))}
            {!isAuthenticated ? (
              <div style={{ display: 'grid', gap: '10px', marginTop: '16px' }}>
                <Link to="/login" style={{ color: '#fff', fontWeight: 700 }}>Sign In</Link>
                <Link to="/login?tab=register" className="btn-primary" style={{ textAlign: 'center', padding: '12px 18px', borderRadius: '999px', fontWeight: 700 }}>Get Started</Link>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

Navbar.propTypes = {
  compact: PropTypes.bool
};
