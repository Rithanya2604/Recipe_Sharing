// Built-in recipe catalogue used to seed MongoDB (see seed.js).
// Extracted from the original frontend js/data.js RECIPES array.
module.exports = 
[
  {
    id: 'gulab-jamun', name: 'Gulab Jamun', cuisine: 'indian',  image: '../images/recipes/gulab-jamun.png',
    time: 45, difficulty: 'Easy', rating: 4.7, reviews: 1189,
    tagline: 'Soft milk-dough dumplings soaked in rose-cardamom syrup.',
    hero: '#F4A73C',
    ingredients: [
      { name: 'Milk powder', amt: '1 cup' },
      { name: 'All-purpose flour', amt: '2 tbsp' },
      { name: 'Baking soda', amt: '¼ tsp' },
      { name: 'Ghee', amt: '2 tbsp' },
      { name: 'Milk', amt: '¼ cup' },
      { name: 'Sugar', amt: '1.5 cups' },
      { name: 'Cardamom pods', amt: '4' },
      { name: 'Rose water', amt: '1 tsp' }
    ],
    steps: [
      'Whisk milk powder, flour and baking soda together.',
      'Rub in ghee, then bring together with milk into a soft dough.',
      'Roll into smooth, crack-free balls.',
      'Deep-fry on low heat until evenly deep brown.',
      'Simmer sugar, water and cardamom into a light syrup.',
      'Soak the fried balls in warm syrup for at least 30 minutes before serving.'
    ],
    nutrition: { calories: 150, protein: 3, carbs: 27, fat: 4 }
  },
  {
    id: 'samosa', name: 'Samosa', cuisine: 'indian', image: '../images/recipes/samosa.png',
    time: 20, difficulty: 'Easy', rating: 4.8, reviews: 1250,
    tagline: 'Crisp pastry triangles packed with spiced potato and peas.',
    hero: '#D98C3D',
    ingredients: [
      { name: 'All-purpose flour', amt: '2 cups' },
      { name: 'Carom seeds', amt: '1 tsp' },
      { name: 'Potatoes, boiled', amt: '3 medium' },
      { name: 'Green peas', amt: '½ cup' },
      { name: 'Cumin seeds', amt: '1 tsp' },
      { name: 'Garam masala', amt: '1 tsp' },
      { name: 'Oil', amt: 'for frying' }
    ],
    steps: [
      'Make a stiff dough with flour, carom seeds, oil and water; rest 20 min.',
      'Sauté cumin, peas, mashed potato and spices for the filling.',
      'Roll dough, cut into ovals, shape into cones and fill.',
      'Seal edges with a water-flour paste.',
      'Deep-fry on medium-low heat until golden and crisp.'
    ],
    nutrition: { calories: 260, protein: 5, carbs: 32, fat: 13 }
  },
  {
    id: 'chole-bature', name: 'Chole Bature', cuisine: 'indian', image: '../images/recipes/chole.png',
    time: 30, difficulty: 'Medium', rating: 4.6, reviews: 946,
    tagline: 'Spiced chickpea curry served with pillowy fried bread.',
    hero: '#C7622A',
    ingredients: [
      { name: 'Chickpeas, soaked', amt: '2 cups' },
      { name: 'Onion, chopped', amt: '2' },
      { name: 'Tomato purée', amt: '1 cup' },
      { name: 'Chole masala', amt: '2 tbsp' },
      { name: 'Yogurt', amt: '½ cup' },
      { name: 'All-purpose flour', amt: '2 cups' },
      { name: 'Semolina', amt: '2 tbsp' }
    ],
    steps: [
      'Pressure-cook chickpeas until tender.',
      'Sauté onion, tomato purée and chole masala into a thick base.',
      'Simmer chickpeas in the masala until the gravy thickens.',
      'Knead flour, semolina and yogurt into a soft bature dough; rest 2 hrs.',
      'Roll ovals and deep-fry until puffed and golden.'
    ],
    nutrition: { calories: 420, protein: 14, carbs: 58, fat: 15 }
  },
  {
    id: 'punjabi-thali', name: 'Punjabi Thali', cuisine: 'indian', image: '../images/recipes/thali.png',
    time: 35, difficulty: 'Medium', rating: 4.9, reviews: 202,
    tagline: 'A full platter of dal, sabzi, roti, rice, raita and pickle.',
    hero: '#E0A23B',
    ingredients: [
      { name: 'Yellow dal', amt: '1 cup' },
      { name: 'Mixed vegetables', amt: '2 cups' },
      { name: 'Whole wheat flour', amt: '2 cups' },
      { name: 'Basmati rice', amt: '1 cup' },
      { name: 'Yogurt', amt: '1 cup' },
      { name: 'Ghee', amt: '2 tbsp' }
    ],
    steps: [
      'Cook dal with turmeric and temper with ghee, cumin and garlic.',
      'Sauté mixed vegetables into a simple dry sabzi.',
      'Knead and roll wheat dough into rotis; cook on a hot tawa.',
      'Steam basmati rice until fluffy.',
      'Whisk yogurt with roasted cumin for raita and plate everything together.'
    ],
    nutrition: { calories: 520, protein: 18, carbs: 74, fat: 16 }
  },
  {
    id: 'margherita-pizza', name: 'Margherita Pizza', cuisine: 'italian', image: '../images/recipes/pizza.png',
    time: 40, difficulty: 'Medium', rating: 4.8, reviews: 1532,
    tagline: 'Classic Neapolitan pizza with tomato, mozzarella and basil.',
    hero: '#D8492E',
    ingredients: [
      { name: 'Pizza flour (00)', amt: '500 g' },
      { name: 'Active dry yeast', amt: '2 tsp' },
      { name: 'San Marzano tomatoes', amt: '1 can' },
      { name: 'Fresh mozzarella', amt: '250 g' },
      { name: 'Fresh basil', amt: 'handful' },
      { name: 'Olive oil', amt: '2 tbsp' }
    ],
    steps: [
      'Mix flour, yeast, water and salt; knead 10 minutes.',
      'Prove the dough for at least 2 hours until doubled.',
      'Crush tomatoes with salt and a drizzle of olive oil for the sauce.',
      'Stretch dough, top with sauce and torn mozzarella.',
      'Bake at the highest oven setting until charred and bubbling.',
      'Finish with fresh basil and a swirl of olive oil.'
    ],
    nutrition: { calories: 285, protein: 12, carbs: 36, fat: 10 }
  },
  {
    id: 'spaghetti-carbonara', name: 'Spaghetti Carbonara', cuisine: 'italian',image: '../images/recipes/carbonara.png',
    time: 25, difficulty: 'Easy', rating: 4.7, reviews: 1108,
    tagline: 'Silky egg and pecorino sauce with crisp guanciale.',
    hero: '#E0A23B',
    ingredients: [
      { name: 'Spaghetti', amt: '400 g' },
      { name: 'Guanciale', amt: '150 g' },
      { name: 'Egg yolks', amt: '4' },
      { name: 'Pecorino Romano', amt: '80 g' },
      { name: 'Black pepper', amt: 'to taste' }
    ],
    steps: [
      'Boil spaghetti in well-salted water until al dente.',
      'Render diced guanciale until crisp.',
      'Whisk egg yolks with grated pecorino and black pepper.',
      'Off the heat, toss hot pasta with guanciale and a splash of pasta water.',
      'Stir in the egg mixture quickly to form a creamy sauce, not scrambled eggs.'
    ],
    nutrition: { calories: 560, protein: 24, carbs: 62, fat: 22 }
  },
  {
    id: 'tiramisu', name: 'Tiramisu', cuisine: 'italian',image: '../images/recipes/tira.png',
    time: 30, difficulty: 'Easy', rating: 4.9, reviews: 874,
    tagline: 'Layers of coffee-soaked ladyfingers and mascarpone cream.',
    hero: '#B97B4A',
    ingredients: [
      { name: 'Ladyfingers', amt: '24' },
      { name: 'Espresso, cooled', amt: '1.5 cups' },
      { name: 'Mascarpone', amt: '500 g' },
      { name: 'Egg yolks', amt: '4' },
      { name: 'Sugar', amt: '100 g' },
      { name: 'Cocoa powder', amt: 'for dusting' }
    ],
    steps: [
      'Whisk egg yolks and sugar until pale, then fold in mascarpone.',
      'Dip ladyfingers briefly in espresso.',
      'Layer soaked ladyfingers and mascarpone cream in a dish.',
      'Repeat layers, finishing with cream.',
      'Chill at least 4 hours and dust with cocoa before serving.'
    ],
    nutrition: { calories: 390, protein: 7, carbs: 34, fat: 25 }
  },
  {
    id: 'sushi-rolls', name: 'Sushi Rolls', cuisine: 'japanese',image: '../images/recipes/sushi.png',
    time: 50, difficulty: 'Hard', rating: 4.8, reviews: 1342,
    tagline: 'Vinegared rice rolled with nori, fish and crisp vegetables.',
    hero: '#D6455D',
    ingredients: [
      { name: 'Sushi rice', amt: '2 cups' },
      { name: 'Rice vinegar', amt: '4 tbsp' },
      { name: 'Nori sheets', amt: '6' },
      { name: 'Fresh salmon/tuna', amt: '200 g' },
      { name: 'Cucumber', amt: '1' },
      { name: 'Avocado', amt: '1' }
    ],
    steps: [
      'Cook sushi rice and season with rice vinegar, sugar and salt.',
      'Lay nori on a bamboo mat and spread rice evenly.',
      'Add fish and vegetable strips along the center.',
      'Roll tightly using the mat, sealing the edge with water.',
      'Slice with a wet, sharp knife into even pieces.'
    ],
    nutrition: { calories: 210, protein: 11, carbs: 30, fat: 4 }
  },
  {
    id: 'ramen', name: 'Shoyu Ramen', cuisine: 'japanese',image: '../images/recipes/ramen.png',
    time: 60, difficulty: 'Medium', rating: 4.7, reviews: 998,
    tagline: 'Soy-seasoned broth with springy noodles and soft egg.',
    hero: '#C7622A',
    ingredients: [
      { name: 'Ramen noodles', amt: '4 portions' },
      { name: 'Chicken/pork stock', amt: '1.5 L' },
      { name: 'Soy sauce', amt: '⅓ cup' },
      { name: 'Mirin', amt: '2 tbsp' },
      { name: 'Soft-boiled eggs', amt: '4' },
      { name: 'Scallions', amt: 'to garnish' }
    ],
    steps: [
      'Simmer stock with soy sauce, mirin and aromatics for the tare-seasoned broth.',
      'Soft-boil and marinate eggs in soy and mirin.',
      'Cook noodles until springy, then drain.',
      'Ladle broth over noodles.',
      'Top with sliced egg, scallions and your favourite toppings.'
    ],
    nutrition: { calories: 480, protein: 22, carbs: 58, fat: 16 }
  },
  {
    id: 'tempura-udon', name: 'Tempura Udon', cuisine: 'japanese',image: '../images/recipes/udon.png',
    time: 35, difficulty: 'Medium', rating: 4.6, reviews: 611,
    tagline: 'Thick udon noodles in dashi broth topped with crisp tempura.',
    hero: '#E0A23B',
    ingredients: [
      { name: 'Udon noodles', amt: '4 portions' },
      { name: 'Dashi stock', amt: '1 L' },
      { name: 'Soy sauce', amt: '3 tbsp' },
      { name: 'Mirin', amt: '3 tbsp' },
      { name: 'Shrimp/vegetables', amt: 'for tempura' },
      { name: 'Tempura batter mix', amt: '1 cup' }
    ],
    steps: [
      'Season dashi with soy sauce and mirin for the broth.',
      'Cook udon noodles until tender and drain.',
      'Dip shrimp and vegetables in cold tempura batter and fry until crisp.',
      'Warm noodles in broth and ladle into bowls.',
      'Top with hot tempura just before serving so it stays crisp.'
    ],
    nutrition: { calories: 430, protein: 15, carbs: 62, fat: 12 }
  },
  {
    id: 'bibimbap', name: 'Bibimbap', cuisine: 'korean',image: '../images/recipes/bibimbap.png',
    time: 40, difficulty: 'Medium', rating: 4.8, reviews: 875,
    tagline: 'Warm rice bowl topped with seasoned vegetables and gochujang.',
    hero: '#F2A93B',
    ingredients: [
      { name: 'Short-grain rice', amt: '2 cups' },
      { name: 'Spinach', amt: '1 bunch' },
      { name: 'Carrot, julienned', amt: '1' },
      { name: 'Bean sprouts', amt: '1 cup' },
      { name: 'Fried egg', amt: '4' },
      { name: 'Gochujang', amt: '3 tbsp' }
    ],
    steps: [
      'Cook rice and keep warm.',
      'Blanch and season spinach and bean sprouts separately.',
      'Sauté carrot until just tender.',
      'Arrange rice in a bowl topped with each vegetable in its own section.',
      'Top with a fried egg and a spoon of gochujang; mix before eating.'
    ],
    nutrition: { calories: 460, protein: 16, carbs: 68, fat: 12 }
  },
  {
    id: 'kimchi-jjigae', name: 'Kimchi Jjigae', cuisine: 'korean',image: '../images/recipes/kimchi.png',
    time: 30, difficulty: 'Easy', rating: 4.7, reviews: 654,
    tagline: 'Bubbling, tangy kimchi stew with pork and soft tofu.',
    hero: '#C7622A',
    ingredients: [
      { name: 'Ripe kimchi', amt: '2 cups' },
      { name: 'Pork belly, sliced', amt: '200 g' },
      { name: 'Soft tofu', amt: '1 block' },
      { name: 'Gochugaru', amt: '1 tbsp' },
      { name: 'Scallions', amt: '2' },
      { name: 'Anchovy stock', amt: '3 cups' }
    ],
    steps: [
      'Stir-fry pork belly until rendered.',
      'Add kimchi and gochugaru, sauté until fragrant.',
      'Pour in stock and simmer 15 minutes.',
      'Add tofu chunks and simmer 5 more minutes.',
      'Garnish with scallions and serve bubbling hot with rice.'
    ],
    nutrition: { calories: 390, protein: 20, carbs: 18, fat: 24 }
  },
  {
    id: 'korean-fried-chicken', name: 'Korean Fried Chicken', cuisine: 'korean',image: '../images/recipes/chicken.png',
    time: 45, difficulty: 'Medium', rating: 4.9, reviews: 1420,
    tagline: 'Double-fried chicken glazed in sweet-spicy gochujang sauce.',
    hero: '#D8492E',
    ingredients: [
      { name: 'Chicken wings', amt: '1 kg' },
      { name: 'Potato starch', amt: '1 cup' },
      { name: 'Gochujang', amt: '3 tbsp' },
      { name: 'Honey', amt: '3 tbsp' },
      { name: 'Garlic, minced', amt: '4 cloves' },
      { name: 'Soy sauce', amt: '2 tbsp' }
    ],
    steps: [
      'Toss chicken wings in potato starch.',
      'Fry once at low temperature until cooked through.',
      'Rest, then fry a second time at high heat until shatteringly crisp.',
      'Simmer gochujang, honey, garlic and soy sauce into a glaze.',
      'Toss hot wings in the glaze and serve immediately.'
    ],
    nutrition: { calories: 520, protein: 28, carbs: 30, fat: 30 }
  }
].map(r => ({ ...r, rating: r.rating ?? null, reviews: r.reviews ?? 0, hero: r.hero || '', madeOn: '', source: '', contact: '', photo: '' }));
