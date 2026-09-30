/* ==========================================================================
   home.js — Canvas animation, DOM Manipulation, Form Validation, Event Handling
   ========================================================================== */

/* ---------- Canvas API: rising steam puffs above the hero plate ---------- */
(function steamCanvas() {
  const canvas = document.getElementById('steamCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  function makePuff() {
    return { x: W / 2 + (Math.random() * 20 - 10), y: H, r: 4 + Math.random() * 3, speed: .4 + Math.random() * .5, drift: (Math.random() - .5) * .6, alpha: .5 };
  }
  let puffs = Array.from({ length: 8 }, () => ({ ...makePuff(), y: Math.random() * H }));

  function tick() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    puffs.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      p.alpha -= 0.003;
      if (p.y < -10 || p.alpha <= 0) Object.assign(p, makePuff());
      ctx.beginPath();
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------- DOM Manipulation: animated stat counters ---------- */
(function animateStats() {
  const strong = document.querySelectorAll('#homeStats strong[data-count]');
  if (!strong.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 900;
      const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor(progress * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: .4 });
  strong.forEach(el => io.observe(el));
})();

/* ---------- Dynamic Content: build the cuisine grid from the API ---------- */
(async function renderCuisines() {
  const grid = document.getElementById('cuisineGrid');
  if (!grid) return;
  let all = [];
  try { all = await fetchAllRecipes(); } catch (e) { /* leave the grid empty on failure */ }
  const html = Object.entries(CUISINE_META).map(([key, meta]) => {
    const count = all.filter(r => r.cuisine === key).length;
    return `
      <a class="recipe-card" href="pages/recipes.html?cuisine=${key}" style="text-decoration:none;">
        <div class="thumb" style="background:${meta.leaf}22;">
  <img src="${meta.icon}" alt="${meta.label}" class="cuisine-icon">
</div>
        <div class="body">
          <span class="cuisine-tag">${count} recipes</span>
          <h3>${meta.label} Cuisine</h3>
          <span class="save-link">Explore recipes →</span>
        </div>
      </a>`;
  }).join('');
  grid.innerHTML = html;
})();

/* ---------- Form Validation: newsletter email (Event Handling) ---------- */
(function newsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  const input = document.getElementById('newsletterEmail');
  const error = document.getElementById('newsletterError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = input.checkValidity();
    error.style.display = valid ? 'none' : 'block';
    input.classList.toggle('touched', true);
    if (!valid) { input.focus(); return; }
    showToast('Thanks! Check your inbox to confirm.', '📩');
    form.reset();
    input.classList.remove('touched');
  });

  input.addEventListener('input', () => {
    if (input.classList.contains('touched')) {
      error.style.display = input.checkValidity() ? 'none' : 'block';
    }
  });
})();

/* ---------- HTML5 Audio: play/pause toggle ---------- */
(function audioToggle() {
  const btn = document.getElementById('audioToggle');
  const audio = document.getElementById('ambientAudio');
  if (!btn || !audio) return;
  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      btn.textContent = '⏸ Pause cooking playlist preview';
    } else {
      audio.pause();
      btn.textContent = '▶ Play cooking playlist preview';
    }
  });
})();
