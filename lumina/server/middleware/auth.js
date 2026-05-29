import passport from 'passport';

export const requireAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error) {
      next(error);
      return;
    }
    if (!user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const requirePro = (req, res, next) => {
  if (['pro', 'studio'].includes(req.user?.tier) || ['pro', 'studio'].includes(req.user?.plan)) {
    next();
    return;
  }
  res.status(403).json({ success: false, error: 'Pro subscription required', upgradeUrl: '/pricing' });
};

export const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error || !user) {
      req.user = null;
      next();
      return;
    }
    req.user = user;
    next();
  })(req, res, next);
};
