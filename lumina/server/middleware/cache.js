const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export function cacheMiddleware(duration = CACHE_TTL) {
  return (req, res, next) => {
    if (req.headers.authorization) {
      next();
      return;
    }

    const key = req.originalUrl;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < duration) {
      res.json(cached.data);
      return;
    }

    res.sendResponse = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode < 400) {
        cache.set(key, { data, timestamp: Date.now() });
      }
      res.sendResponse(data);
    };
    next();
  };
}

export const clearCache = () => cache.clear();
