// api/subscribe.js
// Handles free resource opt-ins. Receives name, email, and resource slug,
// then sends a branded download email via Resend.
//
// Environment variables needed in Vercel:
//   RESEND_API_KEY  — re_xxxxx (from resend.com dashboard)
//   SITE_URL        — https://yourdomain.com (no trailing slash)

const { Resend } = require('resend');

// Map resource slugs to filenames in /resources/
const RESOURCE_FILES = {
  'monthly-checklist': {
    file:    'monthly-bookkeeping-checklist.pdf',
    subject: 'Your Monthly Bookkeeping Checklist',
    intro:   'Here\'s your free Monthly Bookkeeping Checklist. Use it every month to stay on top of your books.',
  },
  'emergency-plan': {
    file:    'bookkeeping-emergency-plan.pdf',
    subject: 'Your Bookkeeping Emergency Plan',
    intro:   'Here\'s your free Bookkeeping Emergency Plan. Follow it step by step to get caught up and back in control.',
  },
  'software-guide': {
    file:    'bookkeeping-software-guide.pdf',
    subject: 'Your Free Guide: Bookkeeping Software Can\'t Do This For You',
    intro:   'Here\'s your free guide. The habits inside this PDF are what actually keep your books clean — no app can do it for you.',
  },
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, resource } = req.body;

  if (!name || !email || !resource) {
    return res.status(400).json({ error: 'Missing name, email, or resource.' });
  }

  const resourceData = RESOURCE_FILES[resource];
  if (!resourceData) {
    return res.status(400).json({ error: 'Unknown resource.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const downloadUrl = `${process.env.SITE_URL}/resources/${resourceData.file}`;
  const firstName = name.split(' ')[0];

  try {
    await resend.emails.send({
      from:    'Blue Mountain Bookkeeping <orders@bluemountainbookkeepingnwa.com>',
      to:      email,
      subject: resourceData.subject,
      html:    buildEmail({ firstName, intro: resourceData.intro, downloadUrl, subject: resourceData.subject, siteUrl: process.env.SITE_URL }),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe] Resend error:', err.message);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
};

function buildEmail({ firstName, intro, downloadUrl, subject, siteUrl }) {
  const logoUrl = `${siteUrl}/images/logo.jpg`;
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F8FA;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 16px rgba(27,46,75,0.09);">
    <!-- Header -->
    <div style="background:#1B2E4B;padding:24px 32px;text-align:center;">
      <img src="${logoUrl}" alt="Blue Mountain Bookkeeping" width="80" height="80"
        style="border-radius:50%;border:2px solid rgba(42,191,191,0.5);display:block;margin:0 auto 12px;" />
      <p style="margin:0;color:#2ABFBF;font-size:1rem;font-style:italic;font-weight:400;">Blue Mountain Bookkeeping</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <h1 style="margin:0 0 12px;font-size:1.3rem;color:#1B2E4B;">Hi ${firstName}!</h1>
      <p style="margin:0 0 20px;font-size:0.92rem;color:#4A6070;line-height:1.7;">
        ${intro}
      </p>
      <p style="margin:0 0 20px;font-size:0.92rem;color:#4A6070;line-height:1.7;">
        Your download should have started automatically — but if it didn't, use the button below to grab it anytime.
      </p>
      <a href="${downloadUrl}" style="display:inline-block;background:#2ABFBF;color:#1B2E4B;font-weight:700;font-size:0.95rem;padding:14px 28px;border-radius:4px;text-decoration:none;margin-bottom:24px;">
        Download Your Free Guide
      </a>
      <p style="margin:0 0 8px;font-size:0.88rem;color:#4A6070;line-height:1.7;">
        Ready to go further? Our paid tools are built to save you hours every month and give you a real system for your finances.
      </p>
      <a href="${siteUrl}/#tools" style="font-size:0.88rem;color:#1A7A7A;text-decoration:none;font-weight:500;">Browse Bookkeeping Tools →</a>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #EDF4F7;">
        <p style="margin:0;font-size:0.78rem;color:#8FAABB;line-height:1.6;">
          Trouble with the button? Copy and paste this link into your browser:<br>
          <a href="${downloadUrl}" style="color:#2ABFBF;word-break:break-all;">${downloadUrl}</a>
        </p>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#132238;padding:18px 32px;text-align:center;">
      <p style="margin:0;color:rgba(123,184,212,0.5);font-size:0.75rem;">
        &copy; ${new Date().getFullYear()} Blue Mountain Bookkeeping &nbsp;|&nbsp;
        <a href="${siteUrl}/privacy.html" style="color:#2ABFBF;text-decoration:none;">Privacy Policy</a>
        &nbsp;|&nbsp;
        <a href="${siteUrl}/terms.html" style="color:#2ABFBF;text-decoration:none;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}