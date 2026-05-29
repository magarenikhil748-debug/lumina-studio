import passport from 'passport';
import passportGoogle from 'passport-google-oauth20';
import passportJwt from 'passport-jwt';
import User from '../models/User.js';
import { getJwtSecret } from '../utils/tokenUtils.js';
import { createDevUser, findDevUserByEmail, findDevUserByGoogleId, findDevUserById, saveDevUser, usingDb } from '../utils/devStore.js';

const { Strategy: GoogleStrategy } = passportGoogle;
const { Strategy: JwtStrategy, ExtractJwt } = passportJwt;

const cleanEnv = (value, fallback = '') => String(value || fallback).trim();

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: getJwtSecret('JWT_ACCESS_SECRET')
}, async (payload, done) => {
  try {
    const user = usingDb()
      ? await User.findById(payload.userId)
      : findDevUserById(payload.userId);
    if (!user) return done(null, false);
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

passport.use(new GoogleStrategy({
  clientID: cleanEnv(process.env.GOOGLE_CLIENT_ID, 'missing-google-client-id'),
  clientSecret: cleanEnv(process.env.GOOGLE_CLIENT_SECRET, 'missing-google-client-secret'),
  callbackURL: cleanEnv(process.env.GOOGLE_CALLBACK_URL, 'http://localhost:5000/api/auth/google/callback'),
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const name = profile.displayName || email?.split('@')[0] || 'Lumina User';
    const avatar = profile.photos?.[0]?.value || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`;

    if (!email) return done(new Error('Google account did not provide an email'), false);

    if (usingDb()) {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) user = await User.findOne({ email });
      if (user) {
        if (!user.googleId) {
          user.googleId = profile.id;
          if (!user.avatar) user.avatar = avatar;
          await user.save();
        }
        return done(null, user);
      }
      user = await User.create({ googleId: profile.id, name, email, avatar });
      return done(null, user);
    }

    let user = findDevUserByGoogleId(profile.id) || findDevUserByEmail(email);
    if (user) {
      user.googleId = user.googleId || profile.id;
      user.avatar = user.avatar || avatar;
      saveDevUser(user);
      return done(null, user);
    }
    user = await createDevUser({ googleId: profile.id, name, email, avatar });
    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

export default passport;
