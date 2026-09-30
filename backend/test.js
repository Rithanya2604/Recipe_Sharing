const assert = require('assert');
const fs = require('fs');

console.log('Running YummyShare tests...');

// Test 1: server.js exists
assert.strictEqual(
  fs.existsSync('./wrong-file.js'),
  true,
  'server.js should exist'
);

console.log('✓ server.js exists');

// Test 2: Recipe model exists
assert.strictEqual(
  fs.existsSync('./models/Recipe.js'),
  true,
  'Recipe model should exist'
);

console.log('✓ Recipe model exists');

// Test 3: Recipe routes exist
assert.strictEqual(
  fs.existsSync('./routes/recipes.js'),
  true,
  'Recipe routes should exist'
);

console.log('✓ Recipe routes exist');

console.log('All YummyShare tests passed!');