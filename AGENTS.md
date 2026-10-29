# AGENTS.md — rules for AI agents working with this design system

This repo is the source of truth. Read `catalog/index.json` first: it lists every theme and component with its props, usage rules, tokens and file paths.

## Building a page
1. Load `tokens/dist/{theme}.css`, then `foundation/base.css`, then the `component.css` of every component you use (and of the components listed in its `uses`).
2. Copy markup from `component.html` and set variants only through the attributes listed in `props` (`data-tone`, `data-style`, `data-size`, …).
3. Stack sections inside `<main>` with no gap. Spacing comes from `.es-section` (96 / 80 / 64px). Set the section background with `data-surface="base | soft | primary | inverse"`; text, links and the default button remap on their own.
4. Put content in `.es-container` (`data-width="narrow | wide | full"`). Use `.es-grid` with `data-cols` or `data-context` for grids.

## Hard rules
- Never hard-code colors, sizes or radii. Use `--es-*` tokens only.
- Accent is never an action color. One fill button per section.
- Headings: style and tag are separate (a card title is styled h4 but uses `<h3>`).
- Every interactive element needs a visible `:focus-visible` style and a 44px touch target on touch devices.
- Status is never color alone: add text or an icon.
- Icons: Lucide, `stroke-width: 2`, `aria-hidden="true"` when decorative.
- WCAG 2.2 AA: text 4.5:1, borders and icons 3:1. `npm run build` warns about any tone that fails.

## Changing the system
- Edit only sources: `tokens/themes/*.json`, `foundation/`, `atoms|molecules|sections|layouts/*/component.{html,css,json,js}`, `lib/`.
- Never edit generated files: `tokens/dist/`, `catalog/index.json`, `integrations/react/`. Run `npm run build`.
- New component: create a folder with `component.html`, `component.css`, `component.json` (`id` = folder name, `status: "draft"` first). Interactive logic goes in `component.js` and is shared by HTML and React.
- Everything in the repo is written in English.
