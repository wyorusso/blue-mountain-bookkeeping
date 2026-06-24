// api/webhook.js
// Listens for Stripe's "checkout.session.completed" event and emails
// the customer their purchased ZIP download link via Resend.
//
// Environment variables needed in Vercel:
//   STRIPE_SECRET_KEY       — sk_test_xxx / sk_live_xxx
//   STRIPE_WEBHOOK_SECRET   — whsec_xxx
//   RESEND_API_KEY          — re_xxxxx
//   SITE_URL                — https://yourdomain.com (no trailing slash)

const Stripe = require('stripe');
const { Resend } = require('resend');
const { buildPurchaseEmail } = require('./emailTemplate');

const PRODUCT_FILES = {
  'expense-tracker': 'small-business-expense-tracker.zip',
  'cleanup-kit':     'bookkeeping-cleanup-starter-kit.zip',
  'tax-prep-kit':    'tax-prep-mini-kit.zip',
  'resource-bundle': 'bookkeeping_resource_bundle.zip',
};

// Required: disable Vercel's body parsing so Stripe signature verification works
module.exports.config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const stripe   = Stripe(process.env.STRIPE_SECRET_KEY);
  const resend   = new Resend(process.env.RESEND_API_KEY);
  const sig      = req.headers['stripe-signature'];
  const rawBody  = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_status !== 'paid') {
      return res.status(200).json({ received: true });
    }

    const customerEmail = session.customer_details?.email;
    const customerName  = session.customer_details?.name || 'there';
    const firstName     = customerName.split(' ')[0];
    const productSlug   = session.metadata?.product_slug;
    const productName   = session.metadata?.product_name;

    if (!customerEmail || !productSlug) {
      console.error('[webhook] Missing email or product_slug in session', session.id);
      return res.status(200).json({ received: true });
    }

    const fileName = PRODUCT_FILES[productSlug];
    if (!fileName) {
      console.error('[webhook] Unknown product slug:', productSlug);
      return res.status(200).json({ received: true });
    }

    const downloadUrl = `${process.env.SITE_URL}/downloads/${fileName}`;

    try {
      await resend.emails.send({
        from:    'Blue Mountain Bookkeeping <orders@bluemountainbookkeepingnwa.com>',
        to:      customerEmail,
        subject: `Your download: ${productName}`,
        html:    buildPurchaseEmail({ firstName, productName, downloadUrl, siteUrl: process.env.SITE_URL }),
      });
      console.log(`[webhook] Download email sent to ${customerEmail} for ${productSlug}`);
    } catch (emailErr) {
      console.error('[webhook] Resend error:', emailErr.message);
    }
  }

  res.status(200).json({ received: true });
};