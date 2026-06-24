// api/subscribe.js
// Handles free resource opt-ins. Receives name, email, and resource slug,
// then sends a branded download email via Resend.
//
// Environment variables needed in Vercel:
//   RESEND_API_KEY  — re_xxxxx (from resend.com dashboard)
//   SITE_URL        — https://yourdomain.com (no trailing slash)

const { Resend } = require('resend');
const { buildFreeEmail } = require('./emailTemplate');

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
      html:    buildFreeEmail({ firstName, intro: resourceData.intro, downloadUrl, siteUrl: process.env.SITE_URL }),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[subscribe] Resend error:', err.message);
    res.status(500).json({ error: 'Failed to send email. Please try again.' });
  }
};