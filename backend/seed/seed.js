// Loads the built-in recipe catalogue into MongoDB.
// Run with: npm run seed  (from inside backend/)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('../config/db');
const Recipe = require('../models/Recipe');
const recipes = require('./recipesSeed');

(async () => {
  await connectDB();

  let created = 0;
  let updated = 0;

  for (const r of recipes) {
    const result = await Recipe.findOneAndUpdate(
      { id: r.id },
      { ...r, owner: null },
      { upsert: true, new: true, rawResult: true, setDefaultsOnInsert: true }
    );
    if (result.lastErrorObject && result.lastErrorObject.upserted) created++;
    else updated++;
  }

  console.log(`Seed complete — ${created} recipe(s) created, ${updated} already existed and were refreshed.`);
  process.exit(0);
})().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
