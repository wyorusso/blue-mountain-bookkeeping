# Blue Mountain Bookkeeping — Website

A clean, responsive static website for Blue Mountain Bookkeeping — empowering small business owners to manage their own books.

## Project Structure

```
blue-mountain-bookkeeping/
├── index.html          # Main page
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # Nav, forms, toast notifications
└── README.md
```

## Features

- **Sticky navigation** with mobile hamburger menu
- **Hero section** with mountain SVG and brand stripe colors
- **Free resource opt-in forms** (3 resources, each with name + email capture)
- **Paid tools section** with links to Stan Store
- **About section** with brand quote
- **Toast notifications** on form submission
- Fully **responsive** (mobile-first)
- **Accessible** (keyboard nav, ARIA labels, focus rings, reduced motion support)

## Getting Started Locally

Just open `index.html` in your browser — no build step needed. It's a pure HTML/CSS/JS static site.

## Deploying to Vercel

1. Push this repo to GitHub (see below)
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Framework Preset: **Other** (static site — no build needed)
5. Click **Deploy** — done!

Vercel will auto-deploy on every `git push` to main.

## Connecting a Custom Domain on Vercel

1. In your Vercel project → **Settings → Domains**
2. Add your domain (e.g. `bluemountainbookkeeping.com`)
3. Update your DNS records as instructed by Vercel

## Connecting Email Opt-in Forms

The free resource forms currently simulate submission. To wire them up to a real email provider:

### Option A — ConvertKit / Kit
Replace `simulateSubmit()` in `js/main.js` with a fetch call to your ConvertKit form endpoint.

### Option B — Mailchimp
Use Mailchimp's embedded form API or their JavaScript embed.

### Option C — A serverless function on Vercel
Create an `api/subscribe.js` file in the project root:

```js
export default async function handler(req, res) {
  const { email, name, resource } = req.body;
  // Call your email provider's API here
  res.status(200).json({ ok: true });
}
```

Then update `simulateSubmit` in `main.js` to `fetch('/api/subscribe', { method: 'POST', ... })`.

## Paid Products

The "Learn More" buttons on the Bookkeeping Tools section currently link to:
`https://stan.store/bluemountainbookkeeping`

Update the `href` on each `.btn` in the tools section to point to individual product pages once you migrate off Stan Store.

## Updating Content

All content lives in `index.html`. Search for the section you want to edit — sections are clearly commented:
- `<!-- NAV -->` — navigation links
- `<!-- HERO -->` — headline and subtext  
- `<!-- VALUE PROPS -->` — the 4 pillar cards
- `<!-- FREE RESOURCES -->` — opt-in cards and form text
- `<!-- PAID TOOLS -->` — product cards, prices, and links
- `<!-- ABOUT -->` — about section text
