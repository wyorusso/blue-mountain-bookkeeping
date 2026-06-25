// api/config.js
// Returns public Stripe configuration to the frontend.
// Only exposes publishable key and price IDs — never secret keys.
//
// Environment variables needed in Vercel:
//   STRIPE_PUBLISHABLE_KEY          — pk_test_xxx (Preview) / pk_live_xxx (Production)
//   STRIPE_PRICE_EXPENSE_TRACKER    — price_xxx
//   STRIPE_PRICE_CLEANUP_KIT        — price_xxx
//   STRIPE_PRICE_TAX_PREP_KIT       — price_xxx
//   STRIPE_PRICE_RESOURCE_BUNDLE    — price_xxx

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600'); // cache for 1 hour on Vercel edge

  res.status(200).json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    prices: {
      'expense-tracker': process.env.STRIPE_PRICE_EXPENSE_TRACKER,
      'cleanup-kit':     process.env.STRIPE_PRICE_CLEANUP_KIT,
      'tax-prep-kit':    process.env.STRIPE_PRICE_TAX_PREP_KIT,
      'resource-bundle': process.env.STRIPE_PRICE_RESOURCE_BUNDLE,
    },
  });
};