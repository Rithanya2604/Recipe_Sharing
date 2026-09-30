const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amt: { type: String, default: '' }
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    // URL-friendly slug used by the frontend as the public "id" (kept
    // separate from Mongo's own _id so existing frontend code needs no
    // rework beyond swapping the data source).
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    cuisine: { type: String, required: true },
    image: { type: String, default: '' },
    photo: { type: String, default: '' }, // base64 data URL for user-uploaded photos
    time: { type: Number, default: null },
    difficulty: { type: String, default: '' },
    rating: { type: Number, default: null },
    reviews: { type: Number, default: 0 },
    tagline: { type: String, default: '' },
    hero: { type: String, default: '' },
    madeOn: { type: String, default: '' },
    servings: { type: mongoose.Schema.Types.Mixed, default: 4 },
    source: { type: String, default: '' },
    contact: { type: String, default: '' },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [String], default: [] },
    nutrition: { type: nutritionSchema, default: null },
    // null owner = one of the original seeded/catalogue recipes
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
