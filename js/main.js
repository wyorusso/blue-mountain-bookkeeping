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
function showToast(message, duration = 4500) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}
 
// ============================================
//  FREE RESOURCE OPT-IN FORMS
// ============================================
 
document.querySelectorAll('.free-optin-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resource = form.dataset.resource;
    const resName  = form.dataset.name;
    const nameInput  = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const btn        = form.querySelector('button[type="submit"]');
 
    const name  = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (!name || !email) return;
 
    const originalLabel = btn.textContent;
    btn.disabled    = true;
    btn.textContent = 'Sending…';
 
    try {
      const res = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, resource }),
      });
 
      if (!res.ok) throw new Error('Server error');
 
      // Replace form with success message
      form.innerHTML = `
        <div class="form-success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A7A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>
          Check your inbox! Your <strong>${resName}</strong> is on its way.
        </div>`;
    } catch (err) {
      showToast('Something went wrong. Please try again.');
      btn.disabled    = false;
      btn.textContent = originalLabel;
    }
  });
});
 
// ============================================
//  STRIPE CHECKOUT
//
//  TEST mode:  use pk_test_xxx key + test card 4242 4242 4242 4242
//  LIVE mode:  use pk_live_xxx key
//
//  The publishable key is safe to be in frontend code.
//  The SECRET key lives only in Vercel environment variables.
//
//  After creating products in the Stripe dashboard, paste the
//  price_xxx IDs below for BOTH test and live environments.
// ============================================
 
// ---- PASTE YOUR PUBLISHABLE KEY HERE ----
// Test:  pk_test_xxxxxxxxxxxxx
// Live:  pk_live_xxxxxxxxxxxxx
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Tlft5Pu0X5gecU9E6uUjbEftoiCi717t5ZecpSDNeuvbYqZhASXyN1XaXcQCC5hUXvDQiG3rlNDtabqRYh7kZdi00Fy454INI';

// ---- PASTE YOUR STRIPE PRICE IDs HERE ----
// Get these from: Stripe Dashboard > Products > [product] > Pricing
const STRIPE_PRICE_IDS = {
  'expense-tracker': 'price_1TlgGQPu0X5gecU9zJ6lkdIe',
  'cleanup-kit':     'price_1TlgGjPu0X5gecU9zd6WLVD7',
  'tax-prep-kit':    'price_1TlgH9Pu0X5gecU9h6jtphtK',
  'resource-bundle': 'price_1TlgJLPu0X5gecU92B3ujJJg',
};

// Button labels for reset after error
const BTN_LABELS = {
  'expense-tracker': 'Buy Now — $9',
  'cleanup-kit':     'Buy Now — $19',
  'tax-prep-kit':    'Buy Now — $17',
  'resource-bundle': 'Buy the Bundle — $37',
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
    const product     = btn.dataset.product;
    const priceId     = STRIPE_PRICE_IDS[product];
    const productName = btn.dataset.name;
 
    // Guard: price IDs not yet configured
    if (!priceId || priceId.startsWith('price_REPLACE')) {
      showToast('Checkout coming soon! Check back shortly.');
      return;
    }
 
    btn.disabled    = true;
    btn.textContent = 'Loading checkout…';
 
    try {
      const stripe = getStripe();
      if (!stripe) throw new Error('Stripe.js not loaded');
 
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          priceId,
          productName,
          productSlug: product,   // passed to webhook so it knows which ZIP to send
        }),
      });
 
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }
 
      const { sessionId } = await res.json();
      await stripe.redirectToCheckout({ sessionId });
 
    } catch (err) {
      console.error('[Stripe]', err);
      showToast('Something went wrong. Please try again.');
      btn.disabled    = false;
      btn.textContent = BTN_LABELS[product] || 'Buy Now';
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
 