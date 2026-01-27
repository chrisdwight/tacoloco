# Taco Loco — Final Project

Simple static website for a taco restaurant. This repository contains plain HTML, CSS and vanilla JavaScript intended for a small class project or demo.

Quick start

- Open `index.html` in your browser for a basic preview.
- For a better local dev experience run a lightweight static server (Python3):

```bash
# from the project root
python3 -m http.server 5500
# then open http://localhost:5500 in your browser
```

Project structure (key files)

- `index.html`, `about.html`, `menu.html`, `contact.html` — site pages
- `stylesheet.css` — single stylesheet used across pages
- `cart.js` — client-side cart, checkout modal and simple order tracker (uses `localStorage`)
- `nav.js` — small helper to auto-close the mobile navigation
- `images/` — media assets

Developer notes

- This is a static-only demo: orders and tracking are stored in `localStorage` (keys: `cart`, `lastOrder`). No server-side persistence.
- Menu items in `menu.html` use `button.add-to-cart` elements with a `data-price` attribute. To add a new menu item, copy a `.menu-item` block and update the `data-price` value.
- CSS and JS are intentionally simple and dependency-free.

If you'd like, I can add an automated formatter (Prettier) config and a simple npm-based workflow for linting/formatting.

Formatting & linting (optional)

This repo includes configuration files for consistent formatting and linting:

- `.editorconfig` — editor settings (4-space indentation, LF endings).
- `.prettierrc` / `.prettierignore` — Prettier config and ignore file.
- `.eslintrc.json` — ESLint config (recommended rules + Prettier integration).
- `package.json` — contains `format` and `lint` scripts.

To install the dev tools and run them locally (optional):

```bash
# install dev dependencies
npm install

# format all files (HTML/CSS/JS/MD)
npm run format

# lint JavaScript and auto-fix where possible
npm run lint
```

If you'd like I can run and apply a one-time format pass to the repository, or add a Git pre-commit hook to enforce formatting.
