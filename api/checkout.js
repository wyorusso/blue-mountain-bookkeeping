// api/checkout.js
// Creates a Stripe Checkout Session and returns the session ID.
// The browser then redirects to Stripe's hosted checkout page.
//
// Environment variables needed in Vercel:
//   STRIPE_SECRET_KEY  — sk_test_xxx (Preview) / sk_live_xxx (Production)

const Stripe = require('stripe');

module.exports = async (req, res) => {
  // CORS headers (needed for same-origin fetch, but good practice)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const { priceId, productName, productSlug } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId' });
  }

  const origin = req.headers.origin || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',

      // Collect the customer's email so the webhook can email them the ZIP
      billing_address_collection: 'auto',

      // Pass the product slug in metadata so the webhook knows which ZIP to send
      metadata: {
        product_slug: productSlug,
        product_name: productName,
      },

      success_url: `${origin}/success.html?product=${encodeURIComponent(productName)}`,
      cancel_url:  `${origin}/#tools`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
};
