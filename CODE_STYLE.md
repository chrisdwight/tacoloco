Code style and developer guide

Purpose
- Keep the project minimal and easy to read for other students.

Formatting
- Indentation: 4 spaces (used throughout this project).
- HTML: keep semantic structure, use lowercase filenames and attributes.
- CSS: group related rules together; add section comments for quick lookup.
- JS: prefer clear function names, avoid global variables where possible; small modules are fine in a static site.

Conventions
- Files:
  - `stylesheet.css` contains all styling. Add section headers when inserting new rules (e.g., /* Header */, /* Menu */, /* Modal */).
  - `cart.js` handles cart operations and exposes `window.cartUtils` for debugging.
  - Menu items: each `.menu-item` uses a `button.add-to-cart` with a `data-price` attribute. Keep visible `.price` element and the `data-price` consistent.

Formatting / Tools
- The project includes an `.editorconfig` for editor defaults (4-space indentation).
- Prettier is configured via `.prettierrc`. Run `npm run format` after installing dev deps to apply consistent formatting.
- ESLint is available in `.eslintrc.json`; run `npm run lint` to check JS and auto-fix issues.

Testing locally
- Use `python3 -m http.server 5500` from the project root and open `http://localhost:5500`.

Next steps (optional)
- Add `.editorconfig` and Prettier/ESLint if you want enforced formatting and CI checks.
