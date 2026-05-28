import Stripe from 'stripe';

let stripeInstance = null;

export const STRIPE_API_VERSION = '2026-02-25.clover';

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
      appInfo: {
        name: 'Lumina.ai',
        version: process.env.npm_package_version || '1.0.0',
        url: process.env.CLIENT_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://lumina.so'
      }
    });
  }

  return stripeInstance;
};

export default getStripe;
