# YummyShare

A recipe-sharing site: static HTML/CSS/JS frontend + a Node.js/Express backend
backed by MongoDB for accounts and recipes.

```
yummyshare/
├── index.html, pages/, css/, js/, images/   ← frontend (unchanged look & feel)
└── backend/                                 ← Node.js + Express + MongoDB API
    ├── server.js        Express app: serves the frontend AND the /api routes
    ├── config/db.js      Mongo connection
    ├── models/           User.js, Recipe.js  (Mongoose schemas)
    ├── middleware/auth.js JWT auth guard
    ├── routes/           auth.js, recipes.js
    └── seed/              the 13 built-in recipes + a script to load them
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and run `mongod`, or
  - **Atlas** (free tier): create a cluster at https://www.mongodb.com/atlas and
    copy its connection string.

## 2. Install & configure

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and set:

```
MONGODB_URI=mongodb://127.0.0.1:27017/yummyshare      # or your Atlas URI
JWT_SECRET=some-long-random-string
PORT=5000
```

## 3. Load the built-in recipes into MongoDB

```bash
npm run seed
```

This upserts the 13 catalogue recipes (Indian/Italian/Japanese/Korean) that
used to be hard-coded in `js/data.js`. Safe to re-run any time.

## 4. Run it

```bash
npm start        # or: npm run dev   (auto-restarts on change, via nodemon)
```

Then open **http://localhost:5000** — the same Express server serves the
frontend pages *and* the API, so there's nothing else to run or configure.

## What changed from the static/localStorage version

- **Sign up / Log in** (`pages/signup.html`, `pages/login.html`) now call
  `POST /api/auth/signup` and `POST /api/auth/login`. Passwords are hashed
  with bcrypt server-side and never stored in plain text. A JSON Web Token is
  returned and kept in `localStorage` (`yummyshare_token`) alongside a small
  session object (`yummyshare_session`) used to personalize the nav bar.
- **Recipes** (`pages/recipes.html`, `pages/recipe-detail.html`, the
  homepage's cuisine grid, and the Leftovers matcher) now fetch the full
  catalogue from `GET /api/recipes` instead of a hard-coded array.
- **Publishing a recipe** (`pages/create-recipe.html`) now `POST`s to
  `/api/recipes` (requires being logged in) and the recipe is saved in
  MongoDB, owned by your account, instead of `localStorage`.
- **Deleting your own recipe** (from the Recipes grid, your Profile, or the
  Create page) calls `DELETE /api/recipes/:id`; the API only allows the
  recipe's original author to delete it.
- **Favorites/wishlist** are unchanged and still live in `localStorage` — they
  weren't part of this backend pass, so they still work exactly as before.

## API reference

| Method | Route              | Auth? | Description                              |
|--------|--------------------|-------|-------------------------------------------|
| POST   | `/api/auth/signup`   | –     | `{ name, email, password }` → `{ token, user }` |
| POST   | `/api/auth/login`    | –     | `{ email, password }` → `{ token, user }` |
| GET    | `/api/auth/me`       | ✅    | Returns the logged-in user                |
| GET    | `/api/recipes`       | –     | All recipes (catalogue + user-published)  |
| GET    | `/api/recipes/:id`   | –     | One recipe by its slug                    |
| POST   | `/api/recipes`       | ✅    | Publish a new recipe                      |
| DELETE | `/api/recipes/:id`   | ✅    | Delete a recipe you own                   |

Send the token from login/signup as `Authorization: Bearer <token>` on
protected routes.

## Notes

- Recipe photos uploaded on the Create page are stored as base64 data URLs
  directly on the recipe document — fine for a demo, but for a lot of large
  images you'd want to move to file/object storage (e.g. S3) instead.
- CORS is wide open (`cors()`) since the frontend is served from the same
  Express app; tighten this if you ever split them onto different origins.
