/* ==========================================================================
   YummyShare — main.js
   Shared behaviour loaded on every page: mobile nav, favourites (Local
   Storage), toast notifications, and small DOM-manipulation helpers.
   ========================================================================== */

/* ---------- Event Handling: mobile nav toggle ---------- */
(function initNav() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  if (!header || !toggle) return;

  toggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when a link is picked (DOM manipulation + event delegation)
  header.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('is-open');
      toggle.classList.remove('is-open');
    });
  });
})();

/* ---------- Reflect logged-in session in the nav (Login → Profile pill) ---------- */
(function reflectSession() {
  const link = document.getElementById('navAuthLink');
  if (!link) return;
  const inPagesDir = window.location.pathname.includes('/pages/');
  const profileHref = inPagesDir ? 'profile.html' : 'pages/profile.html';

  let session = null;
  try { session = JSON.parse(localStorage.getItem('yummyshare_session')); } catch (e) { /* not logged in */ }
  if (!session || !session.email) return;

  const name = session.name || session.email.split('@')[0];
  const initials = name.trim().split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();

  link.href = profileHref;
  link.classList.remove('btn-secondary');
  link.style.padding = '.4rem .9rem .4rem .4rem';
  link.style.display = 'inline-flex';
  link.style.alignItems = 'center';
  link.style.gap = '.5rem';
  link.style.background = 'var(--green-100)';
  link.style.color = 'var(--green-700)';
  link.innerHTML = `
    <span style="width:28px;height:28px;border-radius:50%;background:var(--grad-cta);color:#fff;display:grid;place-items:center;font-size:.75rem;font-weight:700;">${initials}</span>
    <span>${name.split(' ')[0]}</span>`;
})();

/* ---------- Logout helper, reusable from any page ---------- */
function yummyshareLogout(redirectTo) {
  localStorage.removeItem('yummyshare_session');
  localStorage.removeItem('yummyshare_token');
  window.location.href = redirectTo || (window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html');
}

/* ---------- Local Storage: favourites ---------- */
const Favorites = {
  KEY: 'yummyshare_favorites',
  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch (e) { return []; }
  },
  has(id) { return this.all().includes(id); },
  toggle(id) {
    const list = this.all();
    const idx = list.indexOf(id);
    if (idx > -1) { list.splice(idx, 1); }
    else { list.push(id); }
    localStorage.setItem(this.KEY, JSON.stringify(list));
    document.dispatchEvent(new CustomEvent('favorites:changed', { detail: { list } }));
    return list.includes(id);
  }
};

/* ---------- Toast (dynamic content update helper) ---------- */
function showToast(message, icon) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = (icon || '✓') + ' <span></span>';
  toast.querySelector('span').textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

/* ---------- Favourite-star buttons wired up on any page ---------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.fav-btn');
  if (!btn) return;
  const id = btn.dataset.recipeId;
  if (!id) return;
  const isFav = Favorites.toggle(id);
  btn.classList.toggle('is-fav', isFav);
  showToast(isFav ? 'Saved to favorites' : 'Removed from favorites', isFav ? '💚' : '👋');
});

// Reflect stored favourite state on load (DOM manipulation from Local Storage)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fav-btn[data-recipe-id]').forEach(btn => {
    if (Favorites.has(btn.dataset.recipeId)) btn.classList.add('is-fav');
  });
});
