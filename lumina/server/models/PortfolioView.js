import mongoose from 'mongoose';

const portfolioViewSchema = new mongoose.Schema({
  portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio', required: true, index: true },
  viewedAt: { type: Date, default: Date.now, index: true, expires: 90 * 24 * 60 * 60 },
  referrer: { type: String, default: 'direct', maxlength: 500 },
  device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  country: { type: String, default: 'unknown', maxlength: 100 },
  browser: { type: String, default: 'unknown', maxlength: 100 },
  sessionId: { type: String, maxlength: 100 }
}, { timestamps: false });

portfolioViewSchema.index({ portfolioId: 1, viewedAt: -1 });

portfolioViewSchema.statics.getAnalytics = function getAnalytics(portfolioId, days = 30) {
  const safeDays = Math.min(90, Math.max(7, Number(days) || 30));
  const since = new Date();
  since.setDate(since.getDate() - safeDays + 1);
  since.setHours(0, 0, 0, 0);

  return this.aggregate([
    {
      $match: {
        portfolioId: new mongoose.Types.ObjectId(portfolioId),
        viewedAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$viewedAt' } },
        views: { $sum: 1 },
        uniqueSessions: { $addToSet: '$sessionId' }
      }
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        views: 1,
        uniqueSessions: { $size: '$uniqueSessions' }
      }
    },
    { $sort: { date: 1 } }
  ]);
};

const PortfolioView = mongoose.model('PortfolioView', portfolioViewSchema);

export default PortfolioView;
