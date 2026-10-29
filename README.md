# zn-design-system

Framework-independent design system (HTML + CSS + tokens) built so AI agents like Claude can produce consistent pages. Includes a React + Vite viewer app.

- **Three themes:** Navy, Yellow/Black, Green. One input color per tone; 8 tones × 9 roles are derived in OKLCH and checked for WCAG 2.2 AA.
- **HTML + CSS is the canonical source.** React wrappers and the catalog are generated from it.
- **Tuning:** density (compact / default / comfortable), radius (sharp / soft / round), light / dark mode, section surfaces.

## Quick start

```bash
npm install
npm run dev        # viewer app at http://localhost:5173
npm run build      # tokens/dist, catalog/index.json, integrations/react
npm run check      # fails if generated files are out of date (used in CI)
```

## Structure

```
tokens/themes/*.json      theme inputs (edit these)
tokens/dist/*.css         generated tokens, one file per theme
foundation/base.css       reset, type, container, section, grid, surfaces
atoms/ molecules/ sections/ layouts/
  {id}/component.html     canonical markup
  {id}/component.css      styles, tokens only
  {id}/component.json     metadata: props, usage rules, tokens
catalog/index.json        generated catalog for agents and the app
integrations/react/       generated React wrappers
lib/                      color math, token and JSX generation (shared by the build and the app)
tools/build.js            the build
app/                      React + Vite viewer
```

## Using it on a site

```html
<link rel="stylesheet" href="tokens/dist/navy.css">
<link rel="stylesheet" href="foundation/base.css">
<link rel="stylesheet" href="atoms/button/component.css">

<section class="es-section" data-surface="primary">
  <div class="es-container">
    <a class="es-button" data-size="lg" href="/contact">Get a valuation</a>
  </div>
</section>
```

Optional on `<html>`: `data-es-mode="dark"`, `data-es-density="compact"`, `data-es-radius="round"`.

React:

```jsx
import { Button } from './integrations/react';
<Button tone="secondary" variant="outline" size="lg">Book a test drive</Button>
```

## Viewer app

The sidebar lists Foundation, Atoms, Components, Sections and Layouts. Each component page has Preview (mobile / tablet / laptop / desktop), Props, Usage, Code (HTML · CSS · JSX) and Tokens. The right panel switches the theme, edits tone colors, sets density and radius, and shows the contrast check. Export saves the theme JSON, Import loads one, and "Download tokens.css" gives the generated CSS.

## Sync

The catalog stays in sync three ways: the Vite dev server rebuilds on every source change, a lefthook pre-commit hook runs the build, and the GitHub Action fails if generated files differ.

See `AGENTS.md` for the rules agents follow.
