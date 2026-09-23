/* ==========================================================================
   profile.js — Session Handling + DOM Manipulation + backend API
   ========================================================================== */
(async function () {
  let session = null;
  try { session = JSON.parse(localStorage.getItem('yummyshare_session')); } catch (e) { /* no session */ }

  const loggedOutState = document.getElementById('loggedOutState');
  const loggedInState = document.getElementById('loggedInState');

  if (!session || !session.email) {
    loggedOutState.style.display = 'block';
    loggedInState.style.display = 'none';
    return;
  }

  loggedOutState.style.display = 'none';
  loggedInState.style.display = 'block';

  const name = session.name || session.email.split('@')[0];
  const initials = name.trim().split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase();

  document.getElementById('profileAvatar').textContent = initials;
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = session.email;

  let ALL = [];
  try { ALL = await fetchAllRecipes(); } catch (e) { showToast("Couldn't load recipes from the server", '⚠️'); }

  /* ---------- Favourites ---------- */
  const favIds = Favorites.all();
  const favRecipes = ALL.filter(r => favIds.includes(r.id));
  document.getElementById('statFavorites').textContent = favRecipes.length;
  const favGrid = document.getElementById('favoritesGrid');
  const favEmpty = document.getElementById('favoritesEmpty');
  if (!favRecipes.length) {
    favEmpty.style.display = 'block';
  } else {
    favGrid.innerHTML = favRecipes.map(r => {
      const meta = CUISINE_META[r.cuisine];
      return `
        <article class="recipe-card">
          <div class="thumb" style="background:${meta.leaf}22;">
            <span><img src="${r.image}" alt="${r.name}" class="recipe-image"></span>
            <button class="fav-btn is-fav" data-recipe-id="${r.id}" aria-label="Remove from favourites">${ICONS.heart}</button>
          </div>
          <div class="body">
            <span class="cuisine-tag">${meta.label}</span>
            <h3><a href="recipe-detail.html?id=${r.id}" style="text-decoration:none;color:inherit;">${r.name}</a></h3>
            <div class="meta"><span>${ICONS.star}<span class="rating">${r.rating}</span></span><span>${ICONS.clock} ${r.time} min</span></div>
          </div>
        </article>`;
    }).join('');
  }
  // Keep the count/grid in sync if a favourite is removed from this page
  document.addEventListener('favorites:changed', (e) => {
    document.getElementById('statFavorites').textContent = e.detail.list.length;
  });

  /* ---------- Recipes you've published ---------- */
  const myRecipes = ALL.filter(r => r.mine);
  document.getElementById('statRecipes').textContent = myRecipes.length;
  const myRecipesList = document.getElementById('myRecipesList');
  const myRecipesEmpty = document.getElementById('myRecipesEmpty');
  if (!myRecipes.length) {
    myRecipesEmpty.style.display = 'block';
  } else {
    myRecipesList.innerHTML = myRecipes.map(r => {
      const meta = getCuisineMeta(r.cuisine);
      return `
      <div class="match-card">
        <div class="thumb-sm" style="background:${meta.leaf}22;">
          ${r.photo ? `<img src="${r.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : meta.icon}
        </div>
        <div style="flex:1;">
          <strong>${r.name}</strong>
          <p class="muted" style="margin:.2rem 0;">${r.difficulty || ''} · ${r.time ? r.time + ' min' : ''} · serves ${r.servings}</p>
        </div>
        <a href="recipe-detail.html?id=${r.id}" class="btn btn-ghost">View →</a>
        <button type="button" class="icon-btn" data-delete-my-recipe="${r.id}" aria-label="Delete recipe">🗑</button>
      </div>`;
    }).join('');

    myRecipesList.querySelectorAll('[data-delete-my-recipe]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiRequest(`/recipes/${btn.dataset.deleteMyRecipe}`, { method: 'DELETE' });
          await fetchAllRecipes(true);
          btn.closest('.match-card').remove();
          const remaining = myRecipesList.querySelectorAll('[data-delete-my-recipe]').length;
          document.getElementById('statRecipes').textContent = remaining;
          if (!remaining) myRecipesEmpty.style.display = 'block';
          showToast('Recipe removed', '🗑');
        } catch (err) {
          showToast(err.message || 'Could not remove recipe', '⚠️');
        }
      });
    });
  }

  /* ---------- Blog posts you've written ---------- */
  const myBlogs = JSON.parse(localStorage.getItem('yummyshare_my_blogs') || '[]');
  document.getElementById('statBlogs').textContent = myBlogs.length;
  const myBlogsList = document.getElementById('myBlogsList');
  const myBlogsEmpty = document.getElementById('myBlogsEmpty');
  if (!myBlogs.length) {
    myBlogsEmpty.style.display = 'block';
  } else {
    myBlogsList.innerHTML = myBlogs.map(b => `
      <div class="match-card">
        <div class="thumb-sm" style="background:${b.accent}22;">📝</div>
        <div style="flex:1;">
          <strong>${b.title}</strong>
          <p class="muted" style="margin:.2rem 0;">${b.category} · ${new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <a href="blog.html" class="btn btn-ghost">View on Blog →</a>
      </div>`).join('');
  }

  /* ---------- Logout ---------- */
  document.getElementById('logoutBtn').addEventListener('click', () => {
    yummyshareLogout('../index.html');
  });
})();
