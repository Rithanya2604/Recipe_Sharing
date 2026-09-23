/* ==========================================================================
   YummyShare — shared data
   Recipes now live in MongoDB and are served by the Node.js/Express API
   (see backend/). This module keeps the small pieces of data that are
   still fine to ship with the page (cuisine metadata, blog posts, the
   leftover-ingredient chip list) plus helpers for fetching + caching the
   recipe catalogue from the API.
   ========================================================================== */

const CUISINE_META = {
  indian:   { label: 'Indian',   leaf: '#3FAE5C', icon: 'images/indian.png' },
  italian:  { label: 'Italian',  leaf: '#E4572E', icon: 'images/italian.png' },
  japanese: { label: 'Japanese', leaf: '#D6455D', icon: 'images/japanese.png' },
  korean:   { label: 'Korean',   leaf: '#F2A93B', icon: 'images/korean.png' }
};

const BLOG_POSTS = [
  {
    id: 'reduce-food-waste',
    title: '7 Simple Habits That Cut Kitchen Food Waste in Half',
    excerpt: 'Small changes to how you shop, store and cook can keep far more food out of the bin — and your leftovers finder can help too.',
    author: 'Meera Nair', date: '2026-06-12', category: 'Sustainability', accent: '#3FAE5C'
  },
  {
    id: 'knife-skills',
    title: 'Knife Skills Every Home Cook Should Practice',
    excerpt: 'A confident dice, chiffonade and julienne make every recipe on YummyShare faster and safer to cook.',
    author: 'Daniel Cho', date: '2026-05-28', category: 'Technique', accent: '#F2A93B'
  },
  {
    id: 'pantry-staples',
    title: 'Building a Global Pantry: One Shelf, Four Cuisines',
    excerpt: 'The dozen ingredients that unlock Indian, Italian, Japanese and Korean cooking without a specialty grocery run.',
    author: 'Aiko Tanaka', date: '2026-05-14', category: 'Pantry', accent: '#D6455D'
  },
  {
    id: 'fermentation-basics',
    title: 'Fermentation Basics: From Kimchi to Sourdough',
    excerpt: 'A gentle introduction to the science of fermenting at home, with beginner-safe recipes to start this weekend.',
    author: 'Priya Suresh', date: '2026-04-30', category: 'Technique', accent: '#E4572E'
  }
];

const LEFTOVER_INGREDIENTS = [
  'potato', 'tomato', 'onion', 'garlic', 'rice', 'egg', 'spinach', 'chickpeas',
  'mozzarella', 'basil', 'pasta', 'soy sauce', 'tofu', 'kimchi', 'scallion',
  'carrot', 'yogurt', 'flour', 'mascarpone', 'nori'
];

/* ==========================================================================
   Recipe catalogue — fetched from the backend API (built-in seeded
   recipes + everything published by users) and cached in memory so
   repeated calls (search, filters, re-renders) don't re-hit the network.
   ========================================================================== */
let _recipesCache = null;

async function fetchAllRecipes(force = false) {
  if (_recipesCache && !force) return _recipesCache;
  const session = getSession();
  const recipes = await apiRequest('/recipes');
  _recipesCache = recipes.map(r => ({
    ...r,
    mine: !!(session && r.owner && r.owner.id === session.id)
  }));
  return _recipesCache;
}

/* Sync access to whatever fetchAllRecipes() last resolved — [] until the
   first fetch has completed. */
function getCachedRecipes() {
  return _recipesCache || [];
}

/* Recipes published by the currently logged-in user, from the cache. */
function getMyRecipes() {
  return getCachedRecipes().filter(r => r.mine);
}

/* Falls back gracefully for a cuisine outside the four built-in ones
   (the Create Recipe form allows "Other"). */
function getCuisineMeta(key) {
  return CUISINE_META[key] || { label: 'Other', leaf: '#8A8577', icon: '🍽️' };
}
