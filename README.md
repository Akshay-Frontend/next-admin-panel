# Product Admin Dashboard

A small admin dashboard for the **Nexgensis Technologies Frontend Assignment**.
Log in, browse products from the DummyJSON API, and manage them (add / edit / delete).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Axios

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Copy env template
cp .env.example .env.local

# 3. Run the dev server
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/login`.

**Demo credentials:** `emilys` / `emilyspass`

### Available scripts

| Script          | What it does                    |
| --------------- | ------------------------------- |
| `npm run dev`   | Start the dev server            |
| `npm run build` | Production build                |
| `npm run start` | Run the production build        |
| `npm run lint`  | ESLint                          |

---

## What's implemented

- **Login** with the DummyJSON `/auth/login` endpoint, plus form validation and inline errors.
- **Route protection** — every `/products/**` page is wrapped in `<AuthGuard>`; unauth'd users go to `/login`.
- **Logout button** in every product-page header.
- **Product list** — desktop table + mobile cards, image / title / category / price / rating / stock.
- **Pagination** — page numbers with ellipsis, Previous / Next, page size (10 / 20 / 50), and "Showing 21–40 of 194"-style text.
- **Search** — debounced (400 ms), goes back to page 1 on change, race-condition safe.
- **Filter** — category dropdown (`/products/categories`).
- **Sort** — by title / price / rating in either direction.
- **Product details** at `/products/[id]` with gallery, description, price, reviews.
- **Not-found** page for invalid IDs.
- **Add / Edit / Delete** — validated form, confirm dialog on delete, submit-button locked while pending.
- **URL as source of truth** — `?page`, `?size`, `?q`, `?category`, `?sortBy`, `?order`. Refresh or share the URL and the same state loads.
- **Loading / empty / error states** with a Retry button for errors.
- **Shared Axios instance** with a request interceptor that adds the auth token and a response interceptor that normalizes errors and handles 401 globally.

---

## Explanations for the "handle carefully" items

### 1. Fast typing must never leave stale results on screen
Two guards are used together in `src/app/products/page.tsx`:

- Every new fetch creates a fresh `AbortController` and the previous one is aborted in the `useEffect` cleanup.
- A monotonically increasing `requestIdRef` is compared before applying results — even if a late response arrives (e.g. `&delay=2000`), the older `requestId` won't match and the update is dropped.

### 2. Search + category at the same time
DummyJSON exposes `/products/search?q=` and `/products/category/{slug}` as separate endpoints — they can't be combined. **Decision: search wins.** When the search box has any value, the category dropdown is disabled and the request goes to `/search`. This is the least surprising behaviour: typing a query should show matches from _all_ categories, not silently filter them out. If the user picks a category from the dropdown, the search box is cleared (via `onCategory`).

### 3. Add / edit / delete aren't really saved by the API
DummyJSON returns fake success responses but doesn't persist changes. The app still sends the real request (so the assignment requirement of hitting the endpoint is satisfied), then mirrors the change into a **client-side overlay** stored in `localStorage`:

- **Added** products go into an `added[]` array with locally-generated IDs (>= 1,000,000 to avoid clashing with API IDs). They're rendered at the top of page 1 when no search / category filter is active.
- **Edited** products are stored as a `Record<id, Partial<Product>>` and merged over the fetched product on the list, details, and edit pages.
- **Deleted** products are stored as a `Set<id>` and filtered out of every render.

The overlay lives in `src/context/LocalProductsContext.tsx` and survives refreshes. Cleared by clearing localStorage.

### 4. Broken URL values must not crash the app
`src/utils/urlParams.ts` runs every incoming search-param through validation:

- `page` — coerced to a positive integer; falls back to `1`.
- `size` — must be one of the allowed values (10 / 20 / 50), else `10`.
- `sortBy` — must be `title` / `price` / `rating`, else empty.
- `order` — `asc` unless explicitly `desc`.
- Long strings for `q` / `category` are trimmed to a hard max.

So visiting `?page=abc&size=999&sortBy=hackme` behaves the same as visiting `/products` with no query. If the pagination component receives a `page` > `totalPages`, it clamps to the last valid page.

### 5. Rapid Save / Login clicks must not multiply requests
Two layers:

- The submit button is `disabled` while the request is in flight (`loading` prop on `<Button>`).
- A `submitLockRef` guards the `onSubmit` handler; even if a click sneaks in during the flip between render and state update, it returns early.

The Axios instance itself does not deduplicate; the guards live where the intent originates (the form and the auth context).



