import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import {
  ChevronDown,
  CreditCard,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Wand2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import usePlan from '../hooks/usePlan';
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
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();
  const currentPlan = normalizePlan(planState.plan || user?.plan || user?.tier);
  const isStarter = currentPlan === 'starter';

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 20);
  });

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

  const avatarUrl = user?.avatar || '';

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          zIndex: 1000,
          background: 'rgba(7,7,15,0.7)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)',
          transition: 'border-color 0.3s ease'
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
              whileHover={{ scale: 1.02 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#fff',
                  boxShadow: '0 0 16px rgba(168,85,247,0.4)'
                }}
              >
                L
              </div>
              <span
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
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
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          >
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ color: '#ffffff' }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 550,
                    color: isActive(link.href) ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    background: isActive(link.href) ? 'rgba(255,255,255,0.06)' : 'transparent',
                    transition: 'color 0.2s ease, background 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="navIndicator"
                      style={{
                        position: 'absolute',
                        bottom: '3px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: '#a855f7'
                      }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {!isAuthenticated ? (
              <div className="lumina-auth-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <motion.button
                    type="button"
                    whileHover={{ color: '#ffffff', background: 'rgba(255,255,255,0.05)' }}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderRadius: '999px',
                      color: 'rgba(255,255,255,0.62)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '8px 13px'
                    }}
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/login?mode=create" style={{ textDecoration: 'none' }}>
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
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '9px 18px',
                      boxShadow: '0 0 16px rgba(168,85,247,0.3)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Get Started Free
                  </motion.button>
                </Link>
              </div>
            ) : (
              <>
                <TierBadge
                  className="lumina-tier-nav"
                  plan={currentPlan}
                  subscriptionStatus={planState.subscriptionStatus}
                  isOnTrial={planState.isTrialing}
                  trialEndsAt={planState.trialEndsAt}
                  inGracePeriod={planState.inGracePeriod}
                  gracePeriodEndsAt={planState.gracePeriodEndsAt}
                  size="md"
                />
                {isStarter && (
                  <Link className="lumina-upgrade-nav" to="/pricing" style={{ textDecoration: 'none' }}>
                    <motion.button
                      type="button"
                      whileHover={{
                        background: 'rgba(168,85,247,0.15)',
                        borderColor: 'rgba(168,85,247,0.5)'
                      }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '999px',
                        color: '#c084fc',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '7px 14px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Sparkles size={12} />
                      Upgrade
                    </motion.button>
                  </Link>
                )}

                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <motion.button
                    type="button"
                    onClick={() => setDropdownOpen((open) => !open)}
                    whileHover={{ background: 'rgba(255,255,255,0.06)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '999px',
                      padding: '4px 10px 4px 4px',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    aria-label="Open account menu"
                    aria-expanded={dropdownOpen}
                  >
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#fff',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          width="28"
                          height="28"
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                        />
                      ) : getInitials(user?.name)}
                    </span>
                    <span
                      className="lumina-avatar-name"
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.86)',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {user?.name?.split(' ')[0] || 'Account'}
                    </span>
                    <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={14} color="rgba(255,255,255,0.42)" />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 10px)',
                          right: 0,
                          width: '230px',
                          background: 'rgba(13,13,26,0.95)',
                          backdropFilter: 'blur(24px)',
                          WebkitBackdropFilter: 'blur(24px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '16px',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
                          overflow: 'hidden',
                          zIndex: 1001
                        }}
                      >
                        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{user?.name}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                          <div style={{ marginTop: '8px' }}>
                            <TierBadge plan={currentPlan} size="sm" />
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
              </>
            )}

            <motion.button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              whileTap={{ scale: 0.9 }}
              className="lumina-mobile-menu-btn"
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
      </header>

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
                <Link to="/login?mode=create" className="btn-primary" style={{ textAlign: 'center', padding: '12px 18px', borderRadius: '999px', fontWeight: 700 }}>Get Started Free</Link>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 920px) {
          .lumina-desktop-nav { display: none !important; }
          .lumina-mobile-menu-btn { display: inline-flex !important; }
        }
        @media (max-width: 720px) {
          .lumina-auth-actions { display: none !important; }
          .lumina-tier-nav, .lumina-upgrade-nav, .lumina-avatar-name { display: none !important; }
        }
      `}</style>
    </>
  );
}

Navbar.propTypes = {
  compact: PropTypes.bool
};
