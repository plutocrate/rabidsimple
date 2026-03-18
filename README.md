# RABID — Frontend v2

Fully refactored frontend. **No backend required.** Firebase replaces the old Express/MongoDB stack entirely.

## What changed

| Before | After |
|---|---|
| Node/Express/MongoDB backend | Firebase (Auth + Firestore + Storage) |
| JWT auth | Firebase Auth (Email + Google) |
| Custom 3D scene editor | Cosmos Keyboards iframe embed |
| Socket detection Python scripts | Removed entirely |
| `lib/api.ts` axios client | `lib/firestore.ts` Firestore services |
| `useSceneStore` (3000+ lines) | `CosmosViewer` component (60 lines) |
| Scene editor dashboard page | Keyboard Models dashboard page |

## Tech stack

- **React 18** + Vite + TypeScript
- **Firebase 10** — Auth, Firestore, Storage
- **Cosmos Keyboards** — https://ryanis.cool/cosmos/ (iframe embed for 3D keyboard configurator)
- **Three.js** via `@react-three/fiber` — fallback viewer when no Cosmos config set
- **Zustand** — client state
- **Tailwind CSS** + Radix UI

## Setup

### 1. Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) → New Project
2. Enable **Authentication** → Sign-in methods: **Email/Password** + **Google**
3. Create **Firestore Database** (start in test mode, add proper rules later)
4. Enable **Storage**
5. Project Settings → Your apps → Add web app → copy config

### 2. Environment

```bash
cp .env.example .env
# Fill in your Firebase values
```

### 3. Install & run

```bash
npm install
npm run dev
```

### 4. Make yourself admin

After your first login, go to Firebase Console → Firestore → `users` collection → your user document → set `role` to `"admin"`.

### 5. Firestore security rules

Paste the rules from `.env.example` into Firebase Console → Firestore → Rules.

---

## Admin dashboard

URL: `/dashboard` (requires admin/team role)

| Page | Path | What it does |
|---|---|---|
| Overview | `/dashboard` | Orders summary + stats from Firestore |
| Products | `/dashboard/products` | Full CRUD — create, edit, delete products |
| Orders | `/dashboard/orders` | View all orders, advance status |
| Keyboard Models | `/dashboard/keyboard-models` | Manage Cosmos configs, set hero model |
| Site Settings | `/dashboard/settings` | Edit hero copy, announcement banner, footer |

## Using Cosmos Keyboards

1. Go to [ryanis.cool/cosmos](https://ryanis.cool/cosmos/)
2. Design your keyboard
3. Click **Share** → **Copy link**
4. In your admin: Dashboard → Keyboard Models → New → paste URL
5. Assign to hero or link to a product slug

The model shows as a live interactive iframe — customers can rotate, zoom and explore the keyboard right on your site.

## Project structure

```
src/
├── lib/
│   ├── firebase.ts       # Firebase app init
│   ├── firestore.ts      # All Firestore CRUD services
│   ├── mockData.ts       # Fallback mock products
│   └── utils.ts
├── store/
│   ├── useAuthStore.ts   # Firebase auth state
│   ├── useProductStore.ts
│   ├── useCartStore.ts
│   └── useModelConfigStore.ts  # Three.js fallback viewer settings
├── components/
│   ├── 3d/
│   │   ├── CosmosViewer.tsx    # Cosmos iframe embed ← new
│   │   ├── LandingViewer.tsx   # Three.js fallback
│   │   └── ProductViewer.tsx   # Three.js fallback
│   ├── dashboard/
│   └── layout/
└── pages/
    ├── dashboard/
    │   ├── DashboardOverview.tsx
    │   ├── DashboardProducts.tsx      # Full CRUD
    │   ├── DashboardOrders.tsx        # Status management
    │   ├── DashboardCosmosEditor.tsx  # Cosmos config manager ← new
    │   └── DashboardSiteSettings.tsx  # Site-wide settings ← new
    ├── shop/
    ├── auth/
    └── legal/
```
