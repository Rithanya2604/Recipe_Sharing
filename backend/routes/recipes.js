const router = require('express').Router();
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

function serialize(recipe) {
  const obj = recipe.toObject();

  delete obj._id;
  delete obj.__v;

  obj.owner = recipe.owner
    ? {
        id: recipe.owner._id.toString(),
        name: recipe.owner.name
      }
    : null;

  return obj;
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Date.now().toString(36)
  );
}

// ============================================================
// READ — GET /api/recipes
// Get all recipes
// ============================================================
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('owner', 'name')
      .sort({ createdAt: -1 });

    res.json(recipes.map(serialize));
  } catch (err) {
    res.status(500).json({
      message: 'Could not load recipes',
      error: err.message
    });
  }
});

// ============================================================
// READ — GET /api/recipes/:id
// Get a single recipe by its ID/slug
// ============================================================
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      id: req.params.id
    }).populate('owner', 'name');

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found'
      });
    }

    res.json(serialize(recipe));
  } catch (err) {
    res.status(500).json({
      message: 'Could not load recipe',
      error: err.message
    });
  }
});

// ============================================================
// CREATE — POST /api/recipes
// Publish a new recipe (requires login)
// ============================================================
router.post('/', auth, async (req, res) => {
  try {
    const body = req.body || {};

    // Validate required fields
    if (!body.name || !body.cuisine) {
      return res.status(400).json({
        message: 'A recipe name and cuisine are required'
      });
    }

    const recipe = await Recipe.create({
      id: slugify(body.name),

      name: body.name,
      cuisine: body.cuisine,

      difficulty: body.difficulty || '',
      time: body.time ? Number(body.time) : null,
      madeOn: body.madeOn || '',
      servings: body.servings || 4,

      source: body.source || '',
      contact: body.contact || '',

      tagline:
        body.tagline ||
        'A homemade recipe shared by a YummyShare cook.',

      hero: body.hero || '',
      photo: body.photo || '',

      ingredients: Array.isArray(body.ingredients)
        ? body.ingredients
        : [],

      steps: Array.isArray(body.steps)
        ? body.steps
        : [],

      rating: null,
      reviews: 0,
      nutrition: null,

      owner: req.user.id
    });

    await recipe.populate('owner', 'name');

    res.status(201).json(serialize(recipe));
  } catch (err) {
    res.status(500).json({
      message: 'Could not publish recipe',
      error: err.message
    });
  }
});

// ============================================================
// UPDATE — PUT /api/recipes/:id
// Update an existing recipe (requires login)
// Only the recipe owner can update it
// ============================================================
router.put('/:id', auth, async (req, res) => {
  try {
    // Find the recipe
    const recipe = await Recipe.findOne({
      id: req.params.id
    });

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found'
      });
    }

    // Check ownership
    if (
      !recipe.owner ||
      recipe.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only update recipes you've published"
      });
    }

    const body = req.body || {};

    // Update only the allowed fields
    if (body.name !== undefined) {
      recipe.name = body.name;
    }

    if (body.cuisine !== undefined) {
      recipe.cuisine = body.cuisine;
    }

    if (body.difficulty !== undefined) {
      recipe.difficulty = body.difficulty;
    }

    if (body.time !== undefined) {
      recipe.time = body.time ? Number(body.time) : null;
    }

    if (body.madeOn !== undefined) {
      recipe.madeOn = body.madeOn;
    }

    if (body.servings !== undefined) {
      recipe.servings = body.servings;
    }

    if (body.source !== undefined) {
      recipe.source = body.source;
    }

    if (body.contact !== undefined) {
      recipe.contact = body.contact;
    }

    if (body.tagline !== undefined) {
      recipe.tagline = body.tagline;
    }

    if (body.hero !== undefined) {
      recipe.hero = body.hero;
    }

    if (body.photo !== undefined) {
      recipe.photo = body.photo;
    }

    if (body.ingredients !== undefined) {
      if (!Array.isArray(body.ingredients)) {
        return res.status(400).json({
          message: 'Ingredients must be an array'
        });
      }

      recipe.ingredients = body.ingredients;
    }

    if (body.steps !== undefined) {
      if (!Array.isArray(body.steps)) {
        return res.status(400).json({
          message: 'Steps must be an array'
        });
      }

      recipe.steps = body.steps;
    }

    // Save changes to MongoDB
    await recipe.save();

    // Populate owner information
    await recipe.populate('owner', 'name');

    res.json(serialize(recipe));
  } catch (err) {
    res.status(500).json({
      message: 'Could not update recipe',
      error: err.message
    });
  }
});

// ============================================================
// DELETE — DELETE /api/recipes/:id
// Delete a recipe (requires login)
// Only the recipe owner can delete it
// ============================================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      id: req.params.id
    });

    if (!recipe) {
      return res.status(404).json({
        message: 'Recipe not found'
      });
    }

    // Check ownership
    if (
      !recipe.owner ||
      recipe.owner.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can only delete recipes you've published"
      });
    }

    await recipe.deleteOne();

    res.json({
      message: 'Recipe deleted'
    });
  } catch (err) {
    res.status(500).json({
      message: 'Could not delete recipe',
      error: err.message
    });
  }
});

module.exports = router;