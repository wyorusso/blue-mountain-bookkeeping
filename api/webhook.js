// api/webhook.js
// Listens for Stripe's "payment succeeded" event and emails the customer
// a download link for their purchased ZIP file.
//
// Environment variables needed in Vercel:
//   STRIPE_SECRET_KEY        — sk_test_xxx / sk_live_xxx
//   STRIPE_WEBHOOK_SECRET    — whsec_xxx  (from Stripe Dashboard > Webhooks)
//   EMAIL_FROM               — your sending address, e.g. support@bluemountainbookkeepingnwa.com
//   EMAIL_HOST               — SMTP host, e.g. smtp.gmail.com
//   EMAIL_PORT               — 465 (SSL) or 587 (TLS)
//   EMAIL_USER               — SMTP username (usually same as EMAIL_FROM)
//   EMAIL_PASS               — SMTP password or app password
//   SITE_URL                 — https://yourdomain.com  (no trailing slash)
//
// IMPORTANT: Vercel must receive the raw request body for Stripe signature
// verification. This is handled by the bodyParser: false config below.

const Stripe    = require('stripe');
const nodemailer = require('nodemailer');

// Map product slugs → ZIP filenames stored in /public/downloads/
// These files should NOT be in /resources/ (publicly browsable).
// Put them in a /downloads/ folder that is NOT linked anywhere on the site —
// the only way to get the link is via this email after purchase.
const PRODUCT_FILES = {
  'expense-tracker': 'small-business-expense-tracker.zip',
  'cleanup-kit':     'bookkeeping-cleanup-starter-kit.zip',
  'tax-prep-kit':    'tax-prep-mini-kit.zip',
  'resource-bundle': 'bookkeeping_resource_bundle.zip',
};

// Vercel config: disable body parsing so we can verify Stripe's signature
export const config = {
  api: { bodyParser: false },
};

// Read raw body from the request stream
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Send the download email via Nodemailer
async function sendDownloadEmail({ to, productName, downloadUrl }) {
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #F5F8FA; margin: 0; padding: 0; }
        .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 16px rgba(27,46,75,0.09); }
        .header { background: #1B2E4B; padding: 28px 32px; }
        .header img { height: 48px; }
        .header-title { color: #2ABFBF; font-size: 1rem; font-style: italic; margin-top: 8px; }
        .body { padding: 32px; }
        .body h1 { font-size: 1.3rem; color: #1B2E4B; margin-bottom: 8px; }
        .body p { font-size: 0.9rem; color: #4A6070; line-height: 1.7; margin-bottom: 16px; }
        .btn { display: inline-block; background: #2ABFBF; color: #1B2E4B; font-weight: 700; font-size: 0.95rem; padding: 14px 28px; border-radius: 4px; text-decoration: none; margin: 8px 0 24px; }
        .note { font-size: 0.8rem; color: #8FAABB; border-top: 1px solid #EDF4F7; padding-top: 16px; margin-top: 8px; }
        .footer { background: #132238; padding: 18px 32px; text-align: center; }
        .footer p { color: rgba(123,184,212,0.5); font-size: 0.75rem; margin: 0; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <div class="header-title">Blue Mountain Bookkeeping</div>
        </div>
        <div class="body">
          <h1>Your download is ready! 🎉</h1>
          <p>Thank you for purchasing <strong>${productName}</strong>. Click the button below to download your ZIP file.</p>
          <a href="${downloadUrl}" class="btn">Download Your Files</a>
          <p>This link will open your download directly. Save the file somewhere handy — your desktop or a dedicated business folder works great.</p>
          <p>Have questions or need help getting started? Reply to this email and we'll get back to you.</p>
          <div class="note">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <a href="${downloadUrl}" style="color:#2ABFBF;word-break:break-all;">${downloadUrl}</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Blue Mountain Bookkeeping &nbsp;|&nbsp;
            <a href="${process.env.SITE_URL}/privacy.html" style="color:#2ABFBF;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    `"Blue Mountain Bookkeeping" <${process.env.EMAIL_FROM}>`,
    to,
    subject: `Your download: ${productName}`,
    html,
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const sig    = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Only handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Only proceed if payment was actually collected (not just a free session)
    if (session.payment_status !== 'paid') {
      return res.status(200).json({ received: true });
    }

    const customerEmail = session.customer_details?.email;
    const productSlug   = session.metadata?.product_slug;
    const productName   = session.metadata?.product_name;

    if (!customerEmail || !productSlug) {
      console.error('[webhook] Missing email or product_slug in session', session.id);
      return res.status(200).json({ received: true }); // Still 200 so Stripe doesn't retry
    }

    const fileName = PRODUCT_FILES[productSlug];
    if (!fileName) {
      console.error('[webhook] Unknown product slug:', productSlug);
      return res.status(200).json({ received: true });
    }

    const downloadUrl = `${process.env.SITE_URL}/downloads/${fileName}`;

    try {
      await sendDownloadEmail({ to: customerEmail, productName, downloadUrl });
      console.log(`[webhook] Download email sent to ${customerEmail} for ${productSlug}`);
    } catch (emailErr) {
      console.error('[webhook] Failed to send email:', emailErr.message);
      // Don't return 500 — Stripe would retry the webhook.
      // Log the failure and investigate via Vercel logs.
    }
  }

  res.status(200).json({ received: true });
};