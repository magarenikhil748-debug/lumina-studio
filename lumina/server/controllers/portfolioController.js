import mongoose from 'mongoose';
import Portfolio from '../models/Portfolio.js';
import PortfolioView from '../models/PortfolioView.js';
import { clearCache } from '../middleware/cache.js';
import { createObjectId, devStore, usingDb } from '../utils/devStore.js';
import { generateSessionId, parseBrowser, parseDevice, parseReferrer } from '../utils/deviceParser.js';
import { ensureUniqueSlug, generateSlug } from '../utils/slugGenerator.js';
import { ensureHex, isValidEmail, isValidUrl, strip } from '../utils/validation.js';

const fallbackPalette = { primary: '#a78bfa', secondary: '#2dd4bf', accent: '#fb7185', bg: '#08080d', text: '#f8fafc' };

const ownerIdOf = (user) => String(user?._id || user?.id || '');

const publicShape = (portfolio) => {
  if (!portfolio) return null;
  const source = typeof portfolio.toObject === 'function' ? portfolio.toObject() : portfolio;
  return { ...source, id: String(source._id || source.id), _id: source._id || source.id };
};

const buildSlug = (name) => generateSlug(name);

const publicNotFoundError = () => Object.assign(new Error('Portfolio not found'), {
  statusCode: 404,
  clientError: 'Portfolio not found',
  clientMessage: "This portfolio may be private or doesn't exist"
});

const countryFromRequest = (req) => strip(
  req.headers['cf-ipcountry']
  || req.headers['x-vercel-ip-country']
  || req.headers['x-country-code']
  || 'unknown'
).slice(0, 100) || 'unknown';

const analyticsSince = (days) => {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);
  return since;
};

const emptyDeviceBreakdown = () => ({
  mobile: { count: 0, percentage: 0 },
  tablet: { count: 0, percentage: 0 },
  desktop: { count: 0, percentage: 0 }
});

const fillMissingDays = (items, days) => {
  const byDate = new Map(items.map((item) => [item.date, item]));
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    const key = date.toISOString().slice(0, 10);
    return byDate.get(key) || { date: key, views: 0, uniqueSessions: 0 };
  });
};

const buildAnalytics = ({ days, viewsOverTime, totalViews, uniqueSessions, topReferrers, deviceCounts }) => {
  const deviceBreakdown = emptyDeviceBreakdown();
  deviceCounts.forEach((item) => {
    if (deviceBreakdown[item.device]) {
      deviceBreakdown[item.device] = {
        count: item.count,
        percentage: totalViews ? Math.round((item.count / totalViews) * 100) : 0
      };
    }
  });

  const bestPerformingDay = viewsOverTime.reduce((best, item) => (
    item.views > (best?.views || 0) ? item : best
  ), null);

  return {
    days,
    totalViews,
    uniqueSessions,
    viewsOverTime,
    topReferrers,
    deviceBreakdown,
    bestPerformingDay: bestPerformingDay?.views ? bestPerformingDay : null
  };
};

const normalizePortfolio = (body, user, existing = {}) => {
  const projects = Array.isArray(body.projects) ? body.projects.slice(0, 5).map((project) => ({
    title: strip(project.title),
    description: strip(project.description),
    techStack: strip(project.techStack),
    liveUrl: strip(project.liveUrl),
    githubUrl: strip(project.githubUrl)
  })).filter((project) => project.title && project.description) : [];

  const payload = {
    ownerId: ownerIdOf(user) || existing.ownerId,
    ownerName: strip(user?.name || existing.ownerName),
    name: strip(body.name),
    title: strip(body.title),
    location: strip(body.location),
    email: strip(body.email).toLowerCase(),
    linkedin: strip(body.linkedin),
    github: strip(body.github),
    photoUrl: strip(body.photoUrl),
    bioVersions: Array.isArray(body.bioVersions) ? body.bioVersions.map(strip).filter(Boolean).slice(0, 3) : [],
    selectedBio: strip(body.selectedBio || body.bio),
    tagline: strip(body.tagline),
    skills: Array.isArray(body.skills) ? body.skills.map((skill) => ({ name: strip(skill.name), category: strip(skill.category) || 'Other' })).filter((skill) => skill.name) : [],
    skillsHeadline: strip(body.skillsHeadline || 'Core strengths'),
    projects,
    layout: ['minimal', 'bold', 'creative', 'editorial', 'premium'].includes(body.layout) ? body.layout : 'premium',
    template: strip(body.template || body.layout || 'premium'),
    colorPalette: {
      primary: ensureHex(body.colorPalette?.primary, fallbackPalette.primary),
      secondary: ensureHex(body.colorPalette?.secondary, fallbackPalette.secondary),
      accent: ensureHex(body.colorPalette?.accent, fallbackPalette.accent),
      bg: ensureHex(body.colorPalette?.bg, fallbackPalette.bg),
      text: ensureHex(body.colorPalette?.text, fallbackPalette.text)
    },
    plan: ['free', 'pro', 'studio'].includes(body.plan) ? body.plan : 'free',
    slug: strip(body.slug || existing.slug || ''),
    isPublic: typeof body.isPublic === 'boolean' ? body.isPublic : existing.isPublic ?? true,
    views: Number(existing.views || body.views || 0),
    exportCount: Number(existing.exportCount || body.exportCount || body.exports || 0),
    exports: Number(existing.exports || body.exports || body.exportCount || 0),
    qualityScore: Math.max(0, Math.min(100, Number(body.qualityScore || 0))),
    generationMetadata: body.generationMetadata || existing.generationMetadata || {}
  };

  if (!payload.name || !payload.title || !payload.email || !payload.selectedBio || !payload.tagline) {
    throw Object.assign(new Error('Name, title, email, selected bio, and tagline are required'), { statusCode: 400 });
  }
  if (!isValidEmail(payload.email)) throw Object.assign(new Error('A valid email is required'), { statusCode: 400 });
  ['linkedin', 'github', 'photoUrl'].forEach((field) => {
    if (!isValidUrl(payload[field])) throw Object.assign(new Error(`${field} must be a valid URL`), { statusCode: 400 });
  });
  projects.forEach((project) => {
    if (!isValidUrl(project.liveUrl) || !isValidUrl(project.githubUrl)) {
      throw Object.assign(new Error('Project URLs must be valid URLs'), { statusCode: 400 });
    }
  });
  return payload;
};

export const getPortfolios = async (req, res, next) => {
  try {
    const ownerId = ownerIdOf(req.user);
    if (usingDb()) {
      const portfolios = await Portfolio.find({ ownerId }).sort({ updatedAt: -1 });
      res.json({ success: true, data: portfolios.map(publicShape) });
      return;
    }
    const portfolios = Array.from(devStore.portfoliosById.values())
      .filter((portfolio) => String(portfolio.ownerId) === ownerId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json({ success: true, data: portfolios.map(publicShape) });
  } catch (error) {
    next(error);
  }
};

export const createPortfolio = async (req, res, next) => {
  try {
    const payload = normalizePortfolio(req.body, req.user);
    if (usingDb()) {
      payload.slug = await ensureUniqueSlug(buildSlug(payload.name), Portfolio);
      const portfolio = await Portfolio.create(payload);
      clearCache();
      res.status(201).json({ success: true, data: publicShape(portfolio) });
      return;
    }
    const now = new Date();
    while (devStore.portfoliosBySlug.has(payload.slug)) payload.slug = buildSlug(payload.name);
    const portfolio = { ...payload, _id: createObjectId(), id: createObjectId(), createdAt: now, updatedAt: now };
    portfolio.id = portfolio._id;
    devStore.portfoliosById.set(portfolio.id, portfolio);
    devStore.portfoliosBySlug.set(portfolio.slug, portfolio);
    clearCache();
    res.status(201).json({ success: true, data: publicShape(portfolio) });
  } catch (error) {
    if (error?.code === 11000) error.statusCode = 409;
    next(error);
  }
};

export const getPortfolioById = async (req, res, next) => {
  try {
    const ownerId = ownerIdOf(req.user);
    const id = strip(req.params.id);
    const portfolio = usingDb()
      ? await Portfolio.findOne({ _id: id, ownerId })
      : devStore.portfoliosById.get(id);
    if (!portfolio || String(portfolio.ownerId) !== ownerId) {
      res.status(404);
      throw new Error('Portfolio not found');
    }
    res.json({ success: true, data: publicShape(portfolio) });
  } catch (error) {
    next(error);
  }
};

export const updatePortfolioById = async (req, res, next) => {
  try {
    const ownerId = ownerIdOf(req.user);
    const id = strip(req.params.id);
    const existing = usingDb()
      ? await Portfolio.findOne({ _id: id, ownerId })
      : devStore.portfoliosById.get(id);
    if (!existing || String(existing.ownerId) !== ownerId) {
      res.status(404);
      throw new Error('Portfolio not found');
    }
    const payload = normalizePortfolio(req.body, req.user, publicShape(existing));
    if (usingDb()) {
      const portfolio = await Portfolio.findOneAndUpdate({ _id: id, ownerId }, payload, { new: true, runValidators: true });
      clearCache();
      res.json({ success: true, data: publicShape(portfolio) });
      return;
    }
    const updated = { ...existing, ...payload, _id: id, id, updatedAt: new Date() };
    devStore.portfoliosById.set(id, updated);
    devStore.portfoliosBySlug.delete(existing.slug);
    devStore.portfoliosBySlug.set(updated.slug, updated);
    clearCache();
    res.json({ success: true, data: publicShape(updated) });
  } catch (error) {
    next(error);
  }
};

const trackPublicView = async (req, portfolio) => {
  const userAgent = req.headers['user-agent'] || '';
  const sessionId = generateSessionId(req);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const portfolioId = String(portfolio._id || portfolio.id);

  if (usingDb()) {
    const existingView = await PortfolioView.findOne({
      portfolioId: portfolio._id,
      sessionId,
      viewedAt: { $gte: oneHourAgo }
    }).select('_id');

    if (existingView) return portfolio;

    await PortfolioView.create({
      portfolioId: portfolio._id,
      referrer: parseReferrer(req.headers.referer),
      device: parseDevice(userAgent),
      country: countryFromRequest(req),
      browser: parseBrowser(userAgent),
      sessionId
    });

    const updated = await Portfolio.findByIdAndUpdate(portfolio._id, { $inc: { views: 1 } }, { new: true });
    portfolio.views = updated?.views ?? Number(portfolio.views || 0) + 1;
    return portfolio;
  }

  const existingView = devStore.portfolioViews.find((view) => (
    String(view.portfolioId) === portfolioId
    && view.sessionId === sessionId
    && new Date(view.viewedAt) >= oneHourAgo
  ));
  if (existingView) return portfolio;

  devStore.portfolioViews.push({
    portfolioId,
    viewedAt: new Date(),
    referrer: parseReferrer(req.headers.referer),
    device: parseDevice(userAgent),
    country: countryFromRequest(req),
    browser: parseBrowser(userAgent),
    sessionId
  });
  portfolio.views = Number(portfolio.views || 0) + 1;
  return portfolio;
};

export const deletePortfolio = async (req, res, next) => {
  try {
    const ownerId = ownerIdOf(req.user);
    const id = strip(req.params.id);
    if (usingDb()) {
      const portfolio = await Portfolio.findOneAndDelete({ _id: id, ownerId });
      if (!portfolio) {
        res.status(404);
        throw new Error('Portfolio not found');
      }
      clearCache();
      res.json({ success: true, message: 'Portfolio deleted' });
      return;
    }
    const portfolio = devStore.portfoliosById.get(id);
    if (!portfolio || String(portfolio.ownerId) !== ownerId) {
      res.status(404);
      throw new Error('Portfolio not found');
    }
    devStore.portfoliosById.delete(id);
    devStore.portfoliosBySlug.delete(portfolio.slug);
    clearCache();
    res.json({ success: true, message: 'Portfolio deleted' });
  } catch (error) {
    next(error);
  }
};

export const getPublicPortfolio = async (req, res, next) => {
  try {
    const slug = strip(req.params.slug);
    if (usingDb()) {
      const portfolio = await Portfolio.findOne({ slug, isPublic: true }).populate('ownerId', 'name avatar tier');
      if (!portfolio) {
        throw publicNotFoundError();
      }
      await trackPublicView(req, portfolio);
      const ownerId = String(portfolio.ownerId?._id || portfolio.ownerId);
      const isOwner = req.user?._id?.toString?.() === ownerId || String(req.user?.id || '') === ownerId;
      res.json({ success: true, data: { ...publicShape(portfolio), isOwner } });
      return;
    }
    const portfolio = devStore.portfoliosBySlug.get(slug);
    if (!portfolio || portfolio.isPublic === false) {
      throw publicNotFoundError();
    }
    await trackPublicView(req, portfolio);
    devStore.portfoliosBySlug.set(slug, portfolio);
    devStore.portfoliosById.set(String(portfolio.id || portfolio._id), portfolio);
    const ownerId = String(portfolio.ownerId);
    const isOwner = String(req.user?._id || req.user?.id || '') === ownerId;
    res.json({ success: true, data: { ...publicShape(portfolio), isOwner } });
  } catch (error) {
    next(error);
  }
};

export const getPortfolioAnalytics = async (req, res, next) => {
  try {
    const ownerId = ownerIdOf(req.user);
    const portfolioId = strip(req.params.id);
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
    const since = analyticsSince(days);

    const portfolio = usingDb()
      ? await Portfolio.findOne({ _id: portfolioId, ownerId }).select('_id')
      : devStore.portfoliosById.get(portfolioId);

    if (!portfolio || String(portfolio.ownerId || ownerId) !== ownerId) {
      res.status(404);
      throw new Error('Portfolio not found');
    }

    if (usingDb()) {
      const [
        rawViewsOverTime,
        totalViews,
        uniqueSessionRows,
        topReferrers,
        deviceCounts
      ] = await Promise.all([
        PortfolioView.getAnalytics(portfolioId, days),
        PortfolioView.countDocuments({ portfolioId, viewedAt: { $gte: since } }),
        PortfolioView.distinct('sessionId', { portfolioId, viewedAt: { $gte: since } }),
        PortfolioView.aggregate([
          { $match: { portfolioId: new mongoose.Types.ObjectId(portfolioId), viewedAt: { $gte: since } } },
          { $group: { _id: '$referrer', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, referrer: '$_id', count: 1 } }
        ]),
        PortfolioView.aggregate([
          { $match: { portfolioId: new mongoose.Types.ObjectId(portfolioId), viewedAt: { $gte: since } } },
          { $group: { _id: '$device', count: { $sum: 1 } } },
          { $project: { _id: 0, device: '$_id', count: 1 } }
        ])
      ]);

      res.json({
        success: true,
        data: buildAnalytics({
          days,
          viewsOverTime: fillMissingDays(rawViewsOverTime, days),
          totalViews,
          uniqueSessions: uniqueSessionRows.filter(Boolean).length,
          topReferrers,
          deviceCounts
        })
      });
      return;
    }

    const rows = devStore.portfolioViews.filter((view) => (
      String(view.portfolioId) === portfolioId && new Date(view.viewedAt) >= since
    ));
    const byDate = Array.from(rows.reduce((map, view) => {
      const date = new Date(view.viewedAt).toISOString().slice(0, 10);
      const current = map.get(date) || { date, views: 0, sessions: new Set() };
      current.views += 1;
      current.sessions.add(view.sessionId);
      map.set(date, current);
      return map;
    }, new Map()).values()).map((item) => ({ date: item.date, views: item.views, uniqueSessions: item.sessions.size }));
    const referrerCounts = Array.from(rows.reduce((map, view) => map.set(view.referrer, (map.get(view.referrer) || 0) + 1), new Map()).entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const deviceCounts = Array.from(rows.reduce((map, view) => map.set(view.device, (map.get(view.device) || 0) + 1), new Map()).entries())
      .map(([device, count]) => ({ device, count }));

    res.json({
      success: true,
      data: buildAnalytics({
        days,
        viewsOverTime: fillMissingDays(byDate, days),
        totalViews: rows.length,
        uniqueSessions: new Set(rows.map((view) => view.sessionId).filter(Boolean)).size,
        topReferrers: referrerCounts,
        deviceCounts
      })
    });
  } catch (error) {
    next(error);
  }
};

export const togglePortfolioVisibility = async (req, res, next) => {
  try {
    const ownerId = ownerIdOf(req.user);
    const portfolioId = strip(req.params.id);

    if (usingDb()) {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, ownerId });
      if (!portfolio) {
        res.status(404);
        throw new Error('Portfolio not found');
      }
      portfolio.isPublic = !portfolio.isPublic;
      await portfolio.save();
      clearCache();
      res.json({
        success: true,
        data: { isPublic: portfolio.isPublic },
        isPublic: portfolio.isPublic,
        message: portfolio.isPublic ? 'Portfolio is now public' : 'Portfolio is now private'
      });
      return;
    }

    const portfolio = devStore.portfoliosById.get(portfolioId);
    if (!portfolio || String(portfolio.ownerId) !== ownerId) {
      res.status(404);
      throw new Error('Portfolio not found');
    }
    portfolio.isPublic = !portfolio.isPublic;
    devStore.portfoliosById.set(portfolioId, portfolio);
    devStore.portfoliosBySlug.set(portfolio.slug, portfolio);
    clearCache();
    res.json({
      success: true,
      data: { isPublic: portfolio.isPublic },
      isPublic: portfolio.isPublic,
      message: portfolio.isPublic ? 'Portfolio is now public' : 'Portfolio is now private'
    });
  } catch (error) {
    next(error);
  }
};

export const trackExport = async (req, res, next) => {
  try {
    const idOrSlug = strip(req.params.id || req.params.slug);
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    if (usingDb()) {
      const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
      const portfolio = await Portfolio.findOneAndUpdate(query, { $inc: { exportCount: 1, exports: 1 } }, { new: true });
      if (!portfolio) {
        res.status(404);
        throw new Error('Portfolio not found');
      }
      res.json({ success: true, data: { exportCount: portfolio.exportCount, exports: portfolio.exports } });
      return;
    }
    const portfolio = devStore.portfoliosById.get(idOrSlug) || devStore.portfoliosBySlug.get(idOrSlug);
    if (!portfolio) {
      res.status(404);
      throw new Error('Portfolio not found');
    }
    portfolio.exportCount = Number(portfolio.exportCount || 0) + 1;
    portfolio.exports = Number(portfolio.exports || 0) + 1;
    devStore.portfoliosById.set(String(portfolio.id || portfolio._id), portfolio);
    devStore.portfoliosBySlug.set(portfolio.slug, portfolio);
    res.json({ success: true, data: { exportCount: portfolio.exportCount, exports: portfolio.exports } });
  } catch (error) {
    next(error);
  }
};
