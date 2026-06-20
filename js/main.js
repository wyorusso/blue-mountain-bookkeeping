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

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- Toast notification ---
const toast = document.getElementById('toast');
let toastTimer;

function showToast(message, duration = 4000) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// --- Opt-in forms ---
// In production, replace the simulateSubmit function with a real
// email service integration (e.g. Mailchimp, ConvertKit, etc.)

const RESOURCE_LABELS = {
  'monthly-checklist': 'Monthly Bookkeeping Checklist',
  'emergency-plan':    'Bookkeeping Emergency Plan',
  'software-guide':    'Bookkeeping Software guide',
};

function simulateSubmit(resource, name) {
  // Replace this with your actual email provider's API call.
  // Example with Mailchimp or ConvertKit:
  //   fetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ email, name, resource }) })
  return new Promise(resolve => setTimeout(resolve, 900));
}

document.querySelectorAll('.optin-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const resource = form.dataset.resource;
    const nameInput  = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const btn        = form.querySelector('button[type="submit"]');

    const name  = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) return;

    // Loading state
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      await simulateSubmit(resource, name);

      // Success
      const label = RESOURCE_LABELS[resource] || 'resource';
      showToast(`✓ Check your inbox! Your ${label} is on its way.`);
      form.reset();
      btn.textContent = '✓ Sent!';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = getOriginalLabel(resource);
      }, 3000);
    } catch {
      showToast('Something went wrong. Please try again.');
      btn.disabled = false;
      btn.textContent = getOriginalLabel(resource);
    }
  });
});

function getOriginalLabel(resource) {
  const labels = {
    'monthly-checklist': 'Get Checklist',
    'emergency-plan':    'Get Plan',
    'software-guide':    'Submit & Download',
  };
  return labels[resource] || 'Submit';
}

// --- Smooth scroll for hash links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
