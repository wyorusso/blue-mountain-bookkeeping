# /downloads

Place your purchasable ZIP files here with these EXACT filenames:

- `small-business-expense-tracker.zip`
- `bookkeeping-cleanup-starter-kit.zip`
- `tax-prep-mini-kit.zip`

## Important: These files ARE publicly accessible by URL

Vercel serves all static files publicly. The security model here is
"obscurity via unguessable URL" — the download link is only sent via
email after a confirmed Stripe payment, so customers can't find it
by browsing the site.

The files are NOT linked anywhere on the website. The only way a
customer gets the URL is through the post-purchase email sent by
the webhook.

## If you want stronger protection later

Options include:
- Signed URLs (pre-signed S3 links that expire after 24 hours)
- A Vercel Edge Function that checks a purchase token before serving the file

For now, the email-only delivery model is standard practice for
small digital product businesses and is perfectly appropriate.
