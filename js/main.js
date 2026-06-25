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

      // Trigger instant browser download
      const fileMap = {
        'monthly-checklist': 'resources/monthly-bookkeeping-checklist.pdf',
        'emergency-plan':    'resources/bookkeeping-emergency-plan.pdf',
        'software-guide':    'resources/bookkeeping-software-guide.pdf',
      };
      const filePath = fileMap[resource];
      if (filePath) {
        const a = document.createElement('a');
        a.href = filePath;
        a.download = '';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Replace form with success message
      form.innerHTML = `
        <div class="form-success">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A7A7A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>
          Downloading now! We also sent a copy to <strong>${email}</strong>.
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
//  Keys and price IDs are loaded from /api/config
//  which reads Vercel environment variables.
//  No secrets or price IDs are hardcoded here.
// ============================================

let stripeInstance  = null;
let stripePrices    = {};

async function initStripe() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to load config');
    const { publishableKey, prices } = await res.json();
    stripePrices   = prices;
    stripeInstance = Stripe(publishableKey);
  } catch (err) {
    console.error('[Stripe] Config load failed:', err);
  }
}

// Load config as soon as the page is ready
initStripe();

const BTN_LABELS = {
  'expense-tracker': 'Buy Now — $9',
  'cleanup-kit':     'Buy Now — $19',
  'tax-prep-kit':    'Buy Now — $17',
  'resource-bundle': 'Buy the Bundle — $37',
};

document.querySelectorAll('.stripe-buy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const product     = btn.dataset.product;
    const productName = btn.dataset.name;
    const priceId     = stripePrices[product];

    if (!priceId) {
      showToast('Checkout coming soon! Check back shortly.');
      return;
    }

    if (!stripeInstance) {
      showToast('Payment system loading, please try again.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Loading checkout…';

    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          priceId,
          productName,
          productSlug: product,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      const { sessionId } = await res.json();
      await stripeInstance.redirectToCheckout({ sessionId });

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