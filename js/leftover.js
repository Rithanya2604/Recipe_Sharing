/* ==========================================================================
   leftover.js — Geolocation API + Dynamic Content Updates + DOM Manipulation
   ========================================================================== */
(async function () {
  const picker = document.getElementById('ingredientPicker');
  const results = document.getElementById('matchResults');
  const subline = document.getElementById('matchSubline');
  const tagList = document.getElementById('pickedTags');
  const ingredientForm = document.getElementById('ingredientForm');
  const ingredientInput = document.getElementById('ingredientInput');
  const suggestions = document.getElementById('ingredientSuggestions');
  const picked = new Set();

  /* ---------- Build quick-pick chips ---------- */
  picker.innerHTML = LEFTOVER_INGREDIENTS.map(ing =>
    `<button type="button" data-ing="${ing}">${ing}</button>`
  ).join('');

  picker.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    togglePicked(btn.dataset.ing);
  });

  /* ---------- Recipe data from the API ---------- */
  let RECIPES_DATA = [];
  try { RECIPES_DATA = await fetchAllRecipes(); } catch (e) { showToast("Couldn't load recipes from the server", '⚠️'); }

  /* ---------- Autocomplete: known chip ingredients + every recipe ingredient ---------- */
  const allIngredientNames = new Set(LEFTOVER_INGREDIENTS);
  RECIPES_DATA.forEach(r => r.ingredients.forEach(i => allIngredientNames.add(i.name.toLowerCase())));
  suggestions.innerHTML = [...allIngredientNames].sort().map(n => `<option value="${n}"></option>`).join('');

  /* ---------- Add/remove helpers, shared by chips + typed entries ---------- */
  function togglePicked(ing) {
    if (picked.has(ing)) picked.delete(ing);
    else picked.add(ing);
    syncUI();
    renderMatches();
  }

  function addPicked(raw) {
    raw.split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
      .forEach(ing => picked.add(ing));
    syncUI();
    renderMatches();
  }

  function removePicked(ing) {
    picked.delete(ing);
    syncUI();
    renderMatches();
  }

  /* ---------- Keep quick-pick chip highlight + tag list in sync with `picked` ---------- */
  function syncUI() {
    picker.querySelectorAll('button[data-ing]').forEach(btn => {
      btn.classList.toggle('is-picked', picked.has(btn.dataset.ing));
    });
    tagList.innerHTML = [...picked].map(ing => `
      <span class="tag-chip">
        ${ing}
        <button type="button" data-remove-tag="${ing}" aria-label="Remove ${ing}">✕</button>
      </span>`).join('');
    tagList.querySelectorAll('[data-remove-tag]').forEach(btn => {
      btn.addEventListener('click', () => removePicked(btn.dataset.removeTag));
    });
  }

  /* ---------- Typed ingredient entry (Event Handling + Form Validation) ---------- */
  ingredientForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = ingredientInput.value.trim();
    if (!value) { ingredientInput.focus(); return; }
    addPicked(value);
    ingredientInput.value = '';
    ingredientInput.focus();
    showToast(`Added to your fridge list`, '🥬');
  });

  // Also let a trailing comma commit an ingredient while typing, without submitting the form
  ingredientInput.addEventListener('keydown', (e) => {
    if (e.key === ',' ) {
      e.preventDefault();
      const value = ingredientInput.value.trim();
      if (value) { addPicked(value); ingredientInput.value = ''; }
    }
  });

  /* ---------- Ranking algorithm ---------- */
  function scoreRecipe(recipe) {
    const names = recipe.ingredients.map(i => i.name.toLowerCase());
    const matched = [...picked].filter(ing => names.some(n => n.includes(ing)));
    const missing = recipe.ingredients.filter(i => !matched.some(m => i.name.toLowerCase().includes(m)));
    const pct = recipe.ingredients.length ? Math.round((matched.length / recipe.ingredients.length) * 100) : 0;
    return { recipe, matched, missing, pct };
  }

  function renderMatches() {
    if (!picked.size) {
      results.innerHTML = '';
      subline.textContent = 'Add a few ingredients above to see ranked recipes.';
      return;
    }
    const scored = RECIPES_DATA.map(scoreRecipe)
      .filter(s => s.matched.length > 0)
      .sort((a, b) => b.pct - a.pct || b.matched.length - a.matched.length)
      .slice(0, 8);

    subline.textContent = `Ranked by ingredient match — ${picked.size} ingredient${picked.size === 1 ? '' : 's'} selected.`;

    if (!scored.length) {
      results.innerHTML = '<div class="empty-state"><p>No recipes match those ingredients yet — try adding a staple like rice or onion.</p></div>';
      return;
    }

    results.innerHTML = scored.map(s => {
      const meta = CUISINE_META[s.recipe.cuisine];
      const missingNames = s.missing.slice(0, 3).map(m => m.name).join(', ');
      return `
        <div class="match-card">
          <div class="thumb-sm">
    <img src="${s.recipe.image}" alt="${s.recipe.name}"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
              <a href="recipe-detail.html?id=${s.recipe.id}" style="font-weight:700;color:var(--ink);text-decoration:none;">${s.recipe.name}</a>
              <strong style="color:var(--green-700);">${s.pct}% match</strong>
            </div>
            <div class="match-bar"><span style="width:${s.pct}%;"></span></div>
            ${s.missing.length ? `<p class="match-missing">Missing: ${missingNames}${s.missing.length > 3 ? '…' : ''}</p>` : `<p class="match-missing" style="color:var(--green-700);">You have everything!</p>`}
          </div>
        </div>`;
    }).join('');
  }

  /* ---------- Geolocation API ---------- */
  const geoBtn = document.getElementById('geoBtn');
  const geoBanner = document.getElementById('geoBanner');
  const geoText = document.getElementById('geoText');

  // Fixed demo coordinates for a "nearest farmers market" (no network call needed)
  const MARKET = { lat: 9.9252, lon: 78.1198, name: 'Gandhi Market' };

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  geoBtn.addEventListener('click', () => {
    if (!('geolocation' in navigator)) {
      geoBanner.style.display = 'flex';
      geoText.textContent = 'Geolocation isn\'t supported in this browser.';
      return;
    }
    geoBanner.style.display = 'flex';
    geoText.textContent = 'Locating you…';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = haversineKm(latitude, longitude, MARKET.lat, MARKET.lon);
        geoText.textContent = `You're about ${distance.toFixed(1)} km from ${MARKET.name} (${latitude.toFixed(3)}, ${longitude.toFixed(3)}).`;
      },
      (err) => {
        geoText.textContent = 'Location permission was denied — enable it in your browser to see distance to nearby markets.';
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  });

  renderMatches();
})();
