/* ==========================================================================
   recipe-detail.js — Dynamic Content Updates + Canvas API + DOM Manipulation
   ========================================================================== */
(async function () {
  const params = new URLSearchParams(window.location.search);
  let ALL;
  try {
    ALL = await fetchAllRecipes(); // built-in catalogue + anything the user has published
  } catch (err) {
    showToast("Couldn't load this recipe from the server", '⚠️');
    return;
  }
  if (!ALL.length) return;
  const id = params.get('id') || ALL[0].id;
  const recipe = ALL.find(r => r.id === id) || ALL[0];
  const meta = getCuisineMeta(recipe.cuisine);

  // ---- Populate hero content dynamically ----
  document.getElementById('pageTitle').textContent = `${recipe.name} — YummyShare`;
  document.getElementById('rCuisine').textContent = `${meta.label} Cuisine${recipe.mine ? ' · Published by you' : ''}`;
  document.getElementById('rName').textContent = recipe.name;
  document.getElementById('rTagline').textContent = recipe.tagline;
  document.getElementById('rTime').textContent = recipe.time;
  document.getElementById('rDifficulty').textContent = recipe.difficulty;
document.getElementById('rPlate').style.background = `radial-gradient(circle at 35% 30%, #fff, ${recipe.hero}22 75%)`;
  // Freshly-published recipes don't have a rating/review count yet
  const ratingLabelEl = document.getElementById('rRating').nextElementSibling;
  if (recipe.rating) {
    document.getElementById('rRating').textContent = recipe.rating;
    document.getElementById('rReviews').textContent = recipe.reviews || 0;
  } else {
    document.getElementById('rRating').textContent = 'New';
    ratingLabelEl.textContent = 'No reviews yet';
  }

  const plate = document.getElementById('rPlate');
  if (recipe.image) {
  document.getElementById('rEmoji').innerHTML =
    `<img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">`;
} else {
  plate.style.background = `radial-gradient(circle at 35% 30%, #fff, ${recipe.hero || meta.leaf}22 75%)`;
  document.getElementById('rEmoji').innerHTML =
    `<img src="${meta.icon}" alt="${meta.label}" class="cuisine-icon">`;
}
  document.getElementById('rCuisineLower').textContent = meta.label;

  const favBtn = document.getElementById('rFavBtn');
  favBtn.dataset.recipeId = recipe.id;
  function syncFavLabel() {
    favBtn.textContent = Favorites.has(recipe.id) ? '💚 Saved to Favorites' : 'Save Recipe';
  }
  syncFavLabel();
  document.addEventListener('favorites:changed', syncFavLabel);

  // ---- Ingredients list ----
  document.getElementById('ingredientList').innerHTML = recipe.ingredients
    .map(i => `<li><span>${i.name}</span>${i.amt ? `<strong>${i.amt}</strong>` : ''}</li>`).join('');

  // ---- Instructions list ----
  document.getElementById('stepList').innerHTML = recipe.steps.length
    ? recipe.steps.map(step => `<li>${step}</li>`).join('')
    : '<li>No steps provided yet.</li>';

  // ---- Related recipes (same cuisine, dynamic DOM build) ----
  const related = ALL.filter(r => r.cuisine === recipe.cuisine && r.id !== recipe.id).slice(0, 3);
  document.getElementById('relatedGrid').innerHTML = related.map(r => `
    <article class="recipe-card">
      <div class="thumb">
   <img src="${r.image}" alt="${r.name}" class="recipe-image">
</div>
      <div class="body">
        <span class="cuisine-tag">${meta.label}${r.mine ? ' · Your recipe' : ''}</span>
        <h3><a href="recipe-detail.html?id=${r.id}" style="text-decoration:none;color:inherit;">${r.name}</a></h3>
        <div class="meta"><span>${r.rating ? `${ICONS.star}<span class="rating">${r.rating}</span>` : `<span class="pill-note" style="padding:.1rem .5rem;">New</span>`}</span><span>${ICONS.clock} ${r.time} min</span></div>
      </div>
    </article>`).join('');

  // ---- Tabs (Event Handling + Dynamic Content Updates) ----
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      document.querySelector(`.tab-panel[data-panel="${btn.dataset.tab}"]`).classList.add('is-active');
      if (btn.dataset.tab === 'nutrition' && recipe.nutrition) drawChart();
    });
  });

  // Freshly-published recipes don't collect nutrition info yet — show a
  // friendly note instead of an empty chart.
  if (!recipe.nutrition) {
    document.querySelector('.tab-panel[data-panel="nutrition"] .chart-panel').innerHTML =
      '<p class="muted">This home cook hasn\'t added nutrition details yet.</p>';
  }

  // ---- Canvas API: nutrition bar chart ----
  function drawChart() {
    const canvas = document.getElementById('nutritionChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const data = [
      { label: 'Calories', value: recipe.nutrition.calories, max: 700, color: '#F5822A' },
      { label: 'Protein (g)', value: recipe.nutrition.protein, max: 35, color: '#3FAE5C' },
      { label: 'Carbs (g)', value: recipe.nutrition.carbs, max: 80, color: '#E4572E' },
      { label: 'Fat (g)', value: recipe.nutrition.fat, max: 35, color: '#D6455D' }
    ];

    const padding = 40;
    const barWidth = (W - padding * 2) / data.length - 24;
    const baseY = H - 40;

    ctx.strokeStyle = '#EDE6D8';
    ctx.beginPath(); ctx.moveTo(padding, baseY); ctx.lineTo(W - padding, baseY); ctx.stroke();

    data.forEach((d, i) => {
      const x = padding + i * ((W - padding * 2) / data.length) + 12;
      const barH = Math.max(6, (d.value / d.max) * (H - 100));
      // bar
      ctx.fillStyle = d.color;
      roundRect(ctx, x, baseY - barH, barWidth, barH, 8);
      ctx.fill();
      // value label
      ctx.fillStyle = '#2B2A28';
      ctx.font = '600 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.value, x + barWidth / 2, baseY - barH - 8);
      // axis label
      ctx.fillStyle = '#6B6660';
      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillText(d.label, x + barWidth / 2, baseY + 18);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  if (recipe.nutrition) drawChart();
})();
