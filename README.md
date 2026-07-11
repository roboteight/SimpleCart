# Demo Store (Angular)

A simple, client-side demo store built with Angular standalone components. It showcases products, favorites, a shopping cart with persistence, product detail pages, query-param-synced pagination, image performance optimizations, sharing links, and a user settings page with contact info and address lookup/validation.

## Features

- Product catalog
  - 40 sample products (local/in-memory)
  - Product detail page with add-to-cart, favorite, share
  - Image performance: lazy-loading (list), high-priority decode (detail), stable aspect ratios
- Pagination
  - Client-side pagination with 10-per-page default
  - Query param sync: `?page=1&pageSize=10`
  - Keyboard navigation: Left/Right arrows to change pages
- Filters & sorting
  - Search, category, min/max price
  - Sort by relevance, price, or name
  - Fully synced to query params: `q`, `category`, `min`, `max`, `sort`
  - Pagination works on filtered results
- Favorites
  - Toggle favorites from list and detail pages
  - Dedicated favorites view
  - Grid/List view toggle, persisted in URL (`?view=grid|list`)
- Product list view toggle
  - Grid/List view toggle on the products page, persisted in URL (`?view=grid|list`)
- Cart
  - Add items from list or detail
  - Local persistence (localStorage)
  - Badge in navbar shows total quantity
  - Product list shows “In cart: X” indicator
- Share
  - Web Share API integration (fallback to clipboard copy)
  - Share from list and detail pages
- Auth
  - Minimal login page (simulated auth)
  - Auth guard for protected pages
- User settings
  - Profile basics: name, email
  - Contact info: phone, address fields
  - Address lookup (mocked suggestions), client-side validation
  - Save disabled until address validates
- Routing
  - Standalone components with route-level lazy loading
  - 404 fallback to products
- Tooling
  - Angular v20
  - Bootstrap styling
  - SSR build target available (serve script included)

## Getting started

Prerequisites
- Node.js 20+ recommended
- npm

Install
- npm install

Run (dev server)
- npm start
  - App runs at http://localhost:4200

Build (production)
- npm run build

Run unit tests
- npm test

Serve SSR build (optional, after build)
- npm run serve:ssr:demo-app-2
  - Server at http://localhost:4000 by default (depends on your setup)

## Scripts

- start: ng serve
- build: ng build
- watch: ng build --watch --configuration development
- test: ng test
- serve:ssr:demo-app-2: node dist/demo-app-2/server/server.mjs

## Application overview

Routing
- / -> redirects to /products
- /products -> product list (filters, sorting, paginated, share, add-to-cart, favorites, lazy images, grid/list view)
- /products/:id -> product detail (share, add-to-cart, favorites, high-priority image)
- /favorites -> favorites list (grid/list view with pagination)
- /cart -> cart page
- /login -> login page
- /settings -> user settings (protected)

Pagination
- Query params: `page`, `pageSize`
- Works with filters; example: `/products?q=headphones&sort=price_desc&page=2&pageSize=12`
- URL stays in sync on navigation and size changes

Filters & sorting (products)
- Params:
  - `q` (text search), `category`, `min` (price), `max` (price), `sort` (relevance|price_asc|price_desc|name_asc|name_desc)
- Example:
  - `/products?q=usb&category=hub&min=20&max=80&sort=price_asc`

View toggle (products and favorites)
- Persisted via `view` query param: `?view=grid` or `?view=list`
- Example:
  - `/products?view=list`
  - `/favorites?view=grid`

Keyboard shortcuts
- Left Arrow: previous page
- Right Arrow: next page

Cart behavior
- Persistent via localStorage
- Product list shows an information badge with quantity if item is already in cart
- Navbar badge shows total quantity

Share behavior
- Uses Web Share API if available (mobile browsers and some desktops)
- Falls back to copying the product URL to the clipboard

User settings
- Form validation for name and email
- Contact details: phone, address lines, city, state/region, postal code, country
- Address validation
  - Debounced lookup with suggestions (mocked data)
  - Manual validation with format checks
  - Save button disabled until address is validated
- All fields included in profile update

## Tech stack

- Angular 20 (standalone components, signals, router)
- RxJS 7
- Bootstrap 5 for UI
- Local, in-memory data for products (no backend)
- LocalStorage for cart persistence

## Development notes

- Components are standalone and lazy-loaded via route `loadComponent`.
- Product data is provided by a service that returns a static array (40 items).
- Images use:
  - List: loading="lazy", decoding="async", fetchpriority="low", explicit width/height and aspect ratio to reduce CLS.
  - Detail: decoding="async", fetchpriority="high".
- Query param sync logic keeps the URL canonical (normalizes missing/invalid values with replaceUrl).
- Filters and sorting are reactive and URL-driven; pagination slices filtered results.
- Grid/List view is preserved across filtering/sorting via the `view` query param.

## Extending the app

- Replace mock address lookup with a real geocoding/autocomplete API (e.g., Google Places, Mapbox).
- Add server-side API for products, favorites, and cart (current app is entirely client-side).
- Introduce server-side pagination if the dataset grows large.
- Add internationalization and currency selection.
- Harden share behavior with UTM params or deep links if you add mobile apps.

## License

MIT
