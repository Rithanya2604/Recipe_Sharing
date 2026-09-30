/* ==========================================================================
   create-recipe.js
   Form Validation, Event Handling, DOM Manipulation, Dynamic Content Updates,
   File preview — publishing now goes through the backend API (auth required).
   ========================================================================== */
(function () {
  const form = document.getElementById('recipeForm');
  if (!form) return;

  /* ---------- Range input live output ---------- */
  const servings = document.getElementById('servings');
  const servingsOut = document.getElementById('servingsOut');
  servings.addEventListener('input', () => { servingsOut.textContent = servings.value; });

  /* ---------- Dynamic ingredient rows (DOM Manipulation) ---------- */
  const ingredientRows = document.getElementById('ingredientRows');
  let rowCount = 0;

  function addIngredientRow(value = '') {
    rowCount++;
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.style.cssText = 'display:flex;gap:.6rem;margin-bottom:.6rem;';
    row.innerHTML = `
      <input type="text" placeholder="e.g. 2 cups rice" value="${value}" class="ingredient-input" style="flex:1;">
      <button type="button" class="icon-btn remove-ingredient" aria-label="Remove ingredient" style="flex-shrink:0;">✕</button>
    `;
    ingredientRows.appendChild(row);
    row.querySelector('.remove-ingredient').addEventListener('click', () => {
      row.remove();
      validateIngredients();
    });
    row.querySelector('.ingredient-input').addEventListener('input', validateIngredients);
  }
  document.getElementById('addIngredient').addEventListener('click', () => addIngredientRow());
  addIngredientRow(); // start with one row

  function getIngredients() {
    return [...ingredientRows.querySelectorAll('.ingredient-input')]
      .map(i => i.value.trim())
      .filter(Boolean);
  }
  function validateIngredients() {
    const field = document.getElementById('f-ingredients');
    const valid = getIngredients().length > 0;
    field.classList.toggle('has-error', !valid);
    return valid;
  }

  /* ---------- File preview via FileReader ---------- */
  const photoInput = document.getElementById('photo');
  const photoPreview = document.getElementById('photoPreview');
  let photoDataUrl = '';
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) { photoPreview.innerHTML = ''; photoDataUrl = ''; return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      photoDataUrl = e.target.result;
      photoPreview.innerHTML = `<img src="${photoDataUrl}" alt="Recipe preview" style="max-width:160px;border-radius:var(--radius-sm);box-shadow:var(--shadow-sm);">`;
    };
    reader.readAsDataURL(file);
  });

  /* ---------- Field-level validation helper ---------- */
  function validateInput(input, fieldId) {
    const field = document.getElementById(fieldId);
    const valid = input.checkValidity();
    field.classList.toggle('has-error', !valid);
    field.classList.toggle('is-valid', valid && input.value !== '');
    return valid;
  }

  const validatedFields = [
    [document.getElementById('title'), 'f-title'],
    [document.getElementById('cuisine'), 'f-cuisine'],
    [document.getElementById('difficulty'), 'f-difficulty'],
    [document.getElementById('time'), 'f-time'],
    [document.getElementById('source'), 'f-website'],
    [document.getElementById('contact'), 'f-email'],
    [document.getElementById('instructions'), 'f-instructions']
  ];
  validatedFields.forEach(([input, fieldId]) => {
    input.addEventListener('input', () => validateInput(input, fieldId));
    input.addEventListener('blur', () => validateInput(input, fieldId));
  });

  /* ---------- Load + render the recipes this account has published ---------- */
  async function loadMyRecipes() {
    try {
      const all = await fetchAllRecipes(true);
      return all.filter(r => r.mine);
    } catch (e) {
      return getMyRecipes();
    }
  }

  function renderRecipeList(list) {
    const container = document.getElementById('myRecipes');
    if (!list.length) {
      container.innerHTML = '<p class="muted">Nothing published yet — your recipe will appear here, on the Recipes page and on your Profile the moment you publish it.</p>';
      return;
    }
    container.innerHTML = list.map(r => {
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
        <a href="recipe-detail.html?id=${r.id}" class="btn btn-ghost" style="padding:.5rem .9rem;">View →</a>
        <button type="button" class="icon-btn" data-remove="${r.id}" aria-label="Delete recipe">🗑</button>
      </div>`;
    }).join('');

    container.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await apiRequest(`/recipes/${btn.dataset.remove}`, { method: 'DELETE' });
          renderRecipeList(await loadMyRecipes());
          showToast('Recipe removed', '🗑');
        } catch (err) {
          showToast(err.message || 'Could not remove recipe', '⚠️');
        }
      });
    });
  }

  (async () => { renderRecipeList(await loadMyRecipes()); })();

  /* ---------- Submit handling ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let allValid = true;
    validatedFields.forEach(([input, fieldId]) => { if (!validateInput(input, fieldId)) allValid = false; });
    if (!validateIngredients()) allValid = false;

    const agree = document.getElementById('agree');
    if (!agree.checkValidity()) { allValid = false; }

    if (!allValid) {
      const firstError = form.querySelector('.has-error input, .has-error select, .has-error textarea');
      if (firstError) firstError.focus();
      showToast('Please fix the highlighted fields', '⚠️');
      return;
    }

    if (!getToken()) {
      showToast('Please log in to publish a recipe', '🔒');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      return;
    }

    const title = document.getElementById('title').value.trim();
    const cuisine = document.getElementById('cuisine').value;
    const meta = getCuisineMeta(cuisine);
    const steps = document.getElementById('instructions').value.trim().split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      name: title,
      cuisine,
      difficulty: document.getElementById('difficulty').value,
      time: Number(document.getElementById('time').value),
      madeOn: document.getElementById('madeOn').value,
      servings: servings.value,
      source: document.getElementById('source').value.trim(),
      contact: document.getElementById('contact').value.trim(),
      tagline: steps[0] ? steps[0].slice(0, 140) : 'A homemade recipe shared by a YummyShare cook.',
      hero: meta.leaf,
      photo: photoDataUrl,
      ingredients: getIngredients().map(name => ({ name, amt: '' })),
      steps
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.setAttribute('disabled', 'true');

    try {
      // Publish to MongoDB via the Node.js/Express API
      await apiRequest('/recipes', { method: 'POST', body: JSON.stringify(payload) });

      document.getElementById('createSuccess').classList.add('is-visible');
      renderRecipeList(await loadMyRecipes());
      form.reset();
      servingsOut.textContent = '4';
      photoPreview.innerHTML = '';
      photoDataUrl = '';
      ingredientRows.innerHTML = '';
      addIngredientRow();
      validatedFields.forEach(([input, fieldId]) => document.getElementById(fieldId).classList.remove('is-valid', 'has-error'));
      setTimeout(() => document.getElementById('createSuccess').classList.remove('is-visible'), 3000);
    } catch (err) {
      showToast(err.message || 'Could not publish recipe', '⚠️');
    } finally {
      submitBtn.removeAttribute('disabled');
    }
  });
})();
