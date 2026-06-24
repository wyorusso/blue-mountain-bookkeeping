/* ============================================
   BLUE MOUNTAIN BOOKKEEPING — Main JS
   ============================================ */

// --- Year in footer ---
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// --- Mobile nav toggle ---
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Toast ---
const toast = document.getElementById('toast');
let toastTimer;
function showToast(message, duration = 4000) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ============================================
//  STRIPE CHECKOUT
//  Replace STRIPE_PUBLISHABLE_KEY with your
//  actual key from stripe.com/dashboard
//
//  Each product also needs a Stripe Price ID.
//  Create products in the Stripe dashboard,
//  then paste the price_xxx IDs below.
// ============================================

const STRIPE_PUBLISHABLE_KEY = 'pk_live_REPLACE_WITH_YOUR_KEY';

// Map product slugs to Stripe Price IDs
// After creating products in Stripe dashboard, replace these:
const STRIPE_PRICE_IDS = {
  'expense-tracker': 'price_REPLACE_EXPENSE_TRACKER',
  'cleanup-kit':     'price_REPLACE_CLEANUP_KIT',
  'tax-prep-kit':    'price_REPLACE_TAX_PREP_KIT',
};

let stripeInstance = null;

function getStripe() {
  if (!stripeInstance && typeof Stripe !== 'undefined') {
    stripeInstance = Stripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripeInstance;
}

document.querySelectorAll('.stripe-buy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const product  = btn.dataset.product;
    const priceId  = STRIPE_PRICE_IDS[product];
    const name     = btn.dataset.name;

    if (!priceId || priceId.startsWith('price_REPLACE')) {
      showToast('Checkout coming soon! Check back shortly.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Loading…';

    try {
      const stripe = getStripe();
      if (!stripe) throw new Error('Stripe not loaded');

      // Option A: Stripe Payment Links (simplest — no backend needed)
      // Replace the URL below with your Payment Link from the Stripe dashboard:
      // stripe.com/dashboard > Payment Links > Create
      // window.location.href = 'https://buy.stripe.com/YOUR_PAYMENT_LINK';

      // Option B: Stripe Checkout (requires a backend /api/checkout endpoint)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, productName: name }),
      });
      const { sessionId } = await res.json();
      await stripe.redirectToCheckout({ sessionId });

    } catch (err) {
      console.error('Stripe error:', err);
      showToast('Something went wrong. Please try again.');
      btn.disabled = false;
      btn.textContent = `Buy Now — ${btn.dataset.price === '900' ? '$9' : btn.dataset.price === '1700' ? '$17' : '$19'}`;
    }
  });
});

// --- Smooth scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
