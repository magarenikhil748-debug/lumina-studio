import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const devStore = {
  usersById: new Map(),
  usersByEmail: new Map(),
  usersByGoogleId: new Map(),
  portfoliosById: new Map(),
  portfoliosBySlug: new Map(),
  portfolioViews: []
};

/**
 * Returns true when Mongoose has an active database connection.
 * @returns {boolean} Whether MongoDB is connected.
 */
export const usingDb = () => mongoose.connection.readyState === 1;

/**
 * Creates a Mongo-like object id string for local development records.
 * @returns {string} ObjectId string.
 */
export const createObjectId = () => new mongoose.Types.ObjectId().toString();

/**
 * Removes private fields from a user document or local user object.
 * @param {object} user - User document or local user.
 * @returns {object|null} Public user shape.
 */
export const toPublicUser = (user) => {
  if (!user) return null;
  const source = typeof user.toObject === 'function' ? user.toObject() : user;
  return {
    id: String(source._id || source.id),
    name: source.name,
    email: source.email,
    avatar: source.avatar,
    tier: source.tier || 'free',
    generationsUsedThisMonth: source.generationsUsedThisMonth || 0,
    generationsResetAt: source.generationsResetAt,
    createdAt: source.createdAt
  };
};

/**
 * Finds a local development user by email.
 * @param {string} email - Email address.
 * @returns {object|null} Local user.
 */
export const findDevUserByEmail = (email = '') => devStore.usersByEmail.get(String(email).trim().toLowerCase()) || null;

/**
 * Finds a local development user by id.
 * @param {string} id - User id.
 * @returns {object|null} Local user.
 */
export const findDevUserById = (id = '') => devStore.usersById.get(String(id)) || null;

/**
 * Finds a local development user by Google profile id.
 * @param {string} googleId - Google profile id.
 * @returns {object|null} Local user.
 */
export const findDevUserByGoogleId = (googleId = '') => devStore.usersByGoogleId.get(String(googleId)) || null;

/**
 * Saves a local development user into all lookup maps.
 * @param {object} user - Local user object.
 * @returns {object} Saved user.
 */
export const saveDevUser = (user) => {
  const normalized = {
    ...user,
    _id: String(user._id || user.id || createObjectId()),
    email: String(user.email).trim().toLowerCase(),
    updatedAt: new Date()
  };
  devStore.usersById.set(normalized._id, normalized);
  devStore.usersByEmail.set(normalized.email, normalized);
  if (normalized.googleId) devStore.usersByGoogleId.set(normalized.googleId, normalized);
  return normalized;
};

/**
 * Creates a local development user with a hashed password.
 * @param {object} payload - User fields.
 * @returns {Promise<object>} Saved local user.
 */
export const createDevUser = async (payload) => {
  const now = new Date();
  const password = payload.password ? await bcrypt.hash(payload.password, 12) : undefined;
  return saveDevUser({
    _id: createObjectId(),
    name: payload.name,
    email: payload.email,
    password,
    googleId: payload.googleId || null,
    avatar: payload.avatar,
    tier: payload.tier || 'free',
    stripeCustomerId: null,
    generationsUsedThisMonth: 0,
    generationsResetAt: payload.generationsResetAt,
    createdAt: now,
    updatedAt: now
  });
};

/**
 * Compares a plain password with a local development user's password hash.
 * @param {object} user - Local user.
 * @param {string} candidate - Candidate password.
 * @returns {Promise<boolean>} Whether the password matches.
 */
export const compareDevPassword = async (user, candidate) => {
  if (!user?.password) return false;
  return bcrypt.compare(candidate, user.password);
};
