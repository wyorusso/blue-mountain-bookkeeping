// api/checkout.js — Vercel Serverless Function
// This runs on the server (never exposed to the browser),
// keeping your Stripe secret key safe.
//
// SETUP:
// 1. In your Vercel project → Settings → Environment Variables, add:
//      STRIPE_SECRET_KEY = sk_live_YOUR_SECRET_KEY
// 2. npm install stripe  (in your project root)

const Stripe = require('stripe');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const { priceId, productName } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      // After purchase, Stripe redirects here.
      // Update YOURDOMAIN.com once your domain is connected:
      success_url: `${req.headers.origin}/success.html?product=${encodeURIComponent(productName)}`,
      cancel_url:  `${req.headers.origin}/#tools`,
      // Collect email so you can deliver the PDF:
      customer_email: undefined, // Stripe will ask for it
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message });
  }
};
