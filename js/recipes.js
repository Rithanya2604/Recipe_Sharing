/* ==========================================================================
   recipes.js — Search & Filter (DOM Manipulation + Dynamic Content Updates)
   Recipe data now comes from the backend API (see js/data.js -> fetchAllRecipes)
   ========================================================================== */
(function () {
  const grid = document.getElementById('recipeGrid');
  const searchInput = document.getElementById('recipeSearch');
  const searchBtn = document.getElementById('searchBtn');
  const filterRow = document.getElementById('cuisineFilters');
  const heading = document.getElementById('resultsHeading');
  const subline = document.getElementById('resultsSubline');
  const count = document.getElementById('resultsCount');
  const emptyState = document.getElementById('emptyState');
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  let activeCuisine = params.get('cuisine') || 'all';
  let query = '';
  let all = []; // populated once the API responds, then reused by every render()

  function cardTemplate(recipe) {
    const meta = getCuisineMeta(recipe.cuisine);
    const thumbStyle = recipe.photo
      ? `background:center/cover no-repeat url('${recipe.photo}');`
      : `background:${meta.leaf}22;`;
    const ratingBlock = recipe.rating
      ? `${ICONS.star}<span class="rating">${recipe.rating}</span> (${recipe.reviews})`
      : `<span class="pill-note" style="padding:.15rem .65rem;">New</span>`;
    return `
      <article class="recipe-card">
        <div class="thumb" style="background:${meta.leaf}22;">
  <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
  <button class="fav-btn" data-recipe-id="${recipe.id}" aria-label="Save recipe" title="Save recipe">${ICONS.heart}</button>
</div>
        <div class="body">
          <span class="cuisine-tag">${meta.label}${recipe.mine ? ' · Your recipe' : ''}</span>
          <h3><a href="recipe-detail.html?id=${recipe.id}" style="text-decoration:none;color:inherit;">${recipe.name}</a></h3>
          <div class="meta">
            <span>${ratingBlock}</span>
          </div>
          <div class="meta">
            <span>${ICONS.clock} ${recipe.time} min</span>
            <span>${ICONS.gauge} ${recipe.difficulty}</span>
          </div>
          <a class="save-link" href="recipe-detail.html?id=${recipe.id}">View Recipe →</a>
        </div>
      </article>`;
  }

  function render() {
    let results = all.filter(r => activeCuisine === 'all' || r.cuisine === activeCuisine);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      results = results.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        (r.tagline || '').toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q))
      );
    }

    grid.innerHTML = results.map(cardTemplate).join('');
    grid.querySelectorAll('.fav-btn[data-recipe-id]').forEach(btn => {
      if (Favorites.has(btn.dataset.recipeId)) btn.classList.add('is-fav');
    });

    emptyState.style.display = results.length ? 'none' : 'block';
    count.textContent = `${results.length} recipe${results.length === 1 ? '' : 's'} found`;

    if (query.trim()) {
      heading.textContent = `Results for "${query.trim()}"`;
      subline.textContent = activeCuisine === 'all' ? 'Across all cuisines' : `Within ${getCuisineMeta(activeCuisine).label} cuisine`;
    } else if (activeCuisine === 'all') {
      heading.textContent = 'All Recipes';
      subline.textContent = 'Every dish across every cuisine on YummyShare — including recipes published by cooks like you';
    } else {
      heading.textContent = `${getCuisineMeta(activeCuisine).label} Cuisine`;
      subline.textContent = `Explore delicious ${getCuisineMeta(activeCuisine).label} recipes`;
    }
  }

  // Delete a user-published recipe directly from the grid (event delegation,
  // so it keeps working after every re-render). Now goes through the API.
  grid.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-delete-recipe]');
    if (!btn) return;
    try {
      await apiRequest(`/recipes/${btn.dataset.deleteRecipe}`, { method: 'DELETE' });
      all = await fetchAllRecipes(true);
      showToast('Recipe removed', '🗑');
      render();
    } catch (err) {
      showToast(err.message || 'Could not remove recipe', '⚠️');
    }
  });

  // Filter chips (Event Handling + Dynamic Content Updates)
  filterRow.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    filterRow.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeCuisine = chip.dataset.cuisine;
    render();
  });

  // Live search-as-you-type
  searchInput.addEventListener('input', (e) => {
    query = e.target.value;
    render();
  });
  searchBtn.addEventListener('click', () => render());
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') render(); });

  // Pre-select chip if a cuisine came from the homepage link
  if (activeCuisine !== 'all') {
    filterRow.querySelectorAll('.chip').forEach(c => c.classList.toggle('is-active', c.dataset.cuisine === activeCuisine));
  }

  (async () => {
    try {
      all = await fetchAllRecipes();
    } catch (err) {
      count.textContent = '0 recipes found';
      emptyState.style.display = 'block';
      showToast("Couldn't load recipes from the server", '⚠️');
      return;
    }
    render();
  })();
})();
