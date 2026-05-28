export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    annualSavings: 0,
    description: 'For creating your first shareable portfolio.',
    features: [
      '1 portfolio',
      '3 AI generations/month',
      '3 basic templates',
      'Public Lumina URL',
      'Basic view analytics'
    ],
    limits: {
      portfolioLimit: 1,
      aiGenerationsPerMonth: 3,
      watermark: true,
      fullAnalytics: false,
      pdfExport: false,
      vercelDeploy: false,
      whiteLabel: false
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 12, annual: 96 },
    annualSavings: 33,
    description: 'For serious creators who want polished proof everywhere.',
    features: [
      'Unlimited portfolios',
      'Unlimited AI generations',
      'All 9 animated templates',
      'No watermark',
      'Full analytics dashboard',
      'PDF export and custom domain export',
      'Priority AI generation',
      'Portfolio versions up to 3'
    ],
    limits: {
      portfolioLimit: -1,
      aiGenerationsPerMonth: -1,
      watermark: false,
      fullAnalytics: true,
      pdfExport: true,
      vercelDeploy: false,
      whiteLabel: false
    }
  },
  studio: {
    id: 'studio',
    name: 'Studio',
    price: { monthly: 29, annual: 232 },
    annualSavings: 33,
    description: 'For freelancers and teams shipping premium client portfolios.',
    features: [
      'Everything in Pro',
      'One-click Vercel deploy',
      'White-label portfolios',
      'Team collaboration, 3 seats',
      'LinkedIn and resume import',
      'AI Portfolio Score and coaching',
      'Password-protected portfolios',
      'Custom fonts upload',
      'React source export',
      'Priority support'
    ],
    limits: {
      portfolioLimit: -1,
      aiGenerationsPerMonth: -1,
      watermark: false,
      fullAnalytics: true,
      pdfExport: true,
      vercelDeploy: true,
      whiteLabel: true
    }
  }
};

export const billingCycles = {
  monthly: { id: 'monthly', label: 'Monthly', suffix: 'mo' },
  annual: { id: 'annual', label: 'Annual', suffix: 'yr' }
};

export const planList = Object.values(PLANS);
