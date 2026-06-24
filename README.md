# Blue Mountain Bookkeeping — Website

Responsive static site with free PDF downloads and Stripe-powered paid product checkout.

## Project Structure

```
blue-mountain-bookkeeping/
├── index.html          # Main page
├── privacy.html        # Privacy Policy
├── terms.html          # Terms of Service
├── success.html        # Post-purchase confirmation
├── css/style.css       # All styles
├── js/main.js          # Nav, Stripe checkout, toast
├── api/checkout.js     # Vercel serverless function (Stripe)
├── images/logo.jpg     # Brand logo
├── resources/          # Drop your PDF files here
│   ├── monthly-bookkeeping-checklist.pdf
│   ├── bookkeeping-emergency-plan.pdf
│   └── bookkeeping-software-guide.pdf
└── vercel.json
```

---

## Step 1 — Create GitHub Repo & Branches

```bash
cd blue-mountain-bookkeeping
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create dev branch for testing
git checkout -b dev
git push -u origin dev

# Push main (live) branch
git checkout main
git push -u origin main
```

On GitHub: Settings → Branches → set `main` as default (production).

---

## Step 2 — Deploy to Vercel

1. Go to **vercel.com → Add New Project** → import your GitHub repo
2. Framework Preset: **Other**
3. Click **Deploy**

### Set up Preview Deployments (dev branch)
Vercel automatically creates a preview URL for every branch.
- `main` branch → your live production URL
- `dev` branch → a unique preview URL (e.g. `blue-mountain-bookkeeping-dev.vercel.app`)

Every push to `dev` gets its own preview link you can share for review before merging to `main`.

---

## Step 3 — Stripe Setup

### 3a. Create a Stripe account
Go to stripe.com → create account → complete business profile.

### 3b. Create Products in Stripe
Stripe Dashboard → Products → Add Product for each:
- Small Business Expense Tracker — $9 one-time
- Tax Prep Mini Kit — $17 one-time
- Bookkeeping Cleanup Starter Kit — $19 one-time

Copy the `price_xxx` ID for each product.

### 3c. Add Environment Variables in Vercel
Vercel Dashboard → Your Project → Settings → Environment Variables:

| Name | Value | Environment |
|------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_xxx` | Production |
| `STRIPE_SECRET_KEY` | `sk_test_xxx` | Preview (dev branch) |

### 3d. Install Stripe dependency
```bash
npm init -y
npm install stripe
```
Commit `package.json` and `package-lock.json`.

### 3e. Update js/main.js
Replace the placeholder values:
```js
const STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_ACTUAL_KEY';
const STRIPE_PRICE_IDS = {
  'expense-tracker': 'price_YOUR_ACTUAL_ID',
  'cleanup-kit':     'price_YOUR_ACTUAL_ID',
  'tax-prep-kit':    'price_YOUR_ACTUAL_ID',
};
```

---

## Step 4 — Add Your PDFs

Drop your three PDF files into the `/resources` folder with these exact names:
- `monthly-bookkeeping-checklist.pdf`
- `bookkeeping-emergency-plan.pdf`
- `bookkeeping-software-guide.pdf`

Commit and push — Vercel serves them automatically.

---

## Step 5 — Connect Your Custom Domain

Vercel Dashboard → Your Project → Settings → Domains → Add domain.
Update DNS at your registrar as directed by Vercel.

---

## Social Links

- Facebook: https://www.facebook.com/bluemountainbookkeepingnwa
- Instagram: https://www.instagram.com/bluemountainbookkeeping

---

## Email Address

Update `hello@bluemountainbookkeeping.com` in terms.html and privacy.html
to your actual contact email before going live.
