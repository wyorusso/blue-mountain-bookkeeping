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

const PRODUCT_FILES = {
  'expense-tracker': 'small-business-expense-tracker.zip',
  'cleanup-kit':     'bookkeeping-cleanup-starter-kit.zip',
  'tax-prep-kit':    'tax-prep-mini-kit.zip',
  'resource-bundle': 'bookkeeping_resource_bundle.zip',
};

// Required: disable Vercel's body parsing so Stripe signature verification works
export const config = {
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

function buildEmail({ firstName, productName, downloadUrl }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F8FA;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 16px rgba(27,46,75,0.09);">
    <div style="background:#1B2E4B;padding:28px 32px;">
      <p style="margin:0;color:#2ABFBF;font-size:1.1rem;font-style:italic;">Blue Mountain Bookkeeping</p>
    </div>
    <div style="padding:32px;">
      <div style="width:56px;height:56px;background:#E1F5F5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:1.5rem;">✓</span>
      </div>
      <h1 style="margin:0 0 12px;font-size:1.3rem;color:#1B2E4B;">You're all set, ${firstName}!</h1>
      <p style="margin:0 0 20px;font-size:0.92rem;color:#4A6070;line-height:1.7;">
        Thank you for purchasing <strong>${productName}</strong>. Your files are ready to download below.
      </p>
      <a href="${downloadUrl}" style="display:inline-block;background:#2ABFBF;color:#1B2E4B;font-weight:700;font-size:0.95rem;padding:14px 28px;border-radius:4px;text-decoration:none;margin-bottom:24px;">
        Download Your Files
      </a>
      <p style="margin:0 0 8px;font-size:0.88rem;color:#4A6070;line-height:1.7;">
        Save the ZIP somewhere easy to find — your desktop or a dedicated business folder works great. 
        If you have any questions getting started, just reply to this email.
      </p>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #EDF4F7;">
        <p style="margin:0;font-size:0.78rem;color:#8FAABB;line-height:1.6;">
          If the button above doesn't work, copy and paste this link:<br>
          <a href="${downloadUrl}" style="color:#2ABFBF;word-break:break-all;">${downloadUrl}</a>
        </p>
      </div>
    </div>
    <div style="background:#132238;padding:18px 32px;text-align:center;">
      <p style="margin:0;color:rgba(123,184,212,0.5);font-size:0.75rem;">
        &copy; ${new Date().getFullYear()} Blue Mountain Bookkeeping &nbsp;|&nbsp;
        <a href="${process.env.SITE_URL}/privacy.html" style="color:#2ABFBF;text-decoration:none;">Privacy Policy</a>
        &nbsp;|&nbsp;
        <a href="${process.env.SITE_URL}/terms.html" style="color:#2ABFBF;text-decoration:none;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>`;
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
        html:    buildEmail({ firstName, productName, downloadUrl }),
      });
      console.log(`[webhook] Download email sent to ${customerEmail} for ${productSlug}`);
    } catch (emailErr) {
      console.error('[webhook] Resend error:', emailErr.message);
    }
  }

  res.status(200).json({ received: true });
};