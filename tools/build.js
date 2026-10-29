#!/usr/bin/env node
// Build: validates themes and components, then writes
//   tokens/dist/{theme}.css      — full tokens per theme
//   catalog/index.json           — component catalog for agents and the app
//   integrations/react/*.jsx     — generated React wrappers
// `--check` writes nothing and exits 1 if any generated file is out of date.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTheme, themeCss, themeColors, TONES } from '../lib/tokens.js';
import { jsxWrapper, componentName } from '../lib/jsx.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const LEVELS = [['atoms', 'atom'], ['molecules', 'molecule'], ['sections', 'section'], ['layouts', 'layout']];
const STATUSES = ['draft', 'stable', 'deprecated'];
const errors = [];
const out = new Map(); // relative path -> content

const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { errors.push(`${rel(p)}: ${e.message}`); return null; } };

// ---- Themes
const themeDir = path.join(root, 'tokens/themes');
const themes = [];
for (const f of fs.readdirSync(themeDir).filter((f) => f.endsWith('.json')).sort()) {
  const t = readJson(path.join(themeDir, f));
  if (!t) continue;
  const errs = validateTheme(t);
  if (errs.length) { errs.forEach((e) => errors.push(`tokens/themes/${f}: ${e}`)); continue; }
  for (const mode of ['light', 'dark']) {
    const { report } = themeColors(t, mode);
    TONES.forEach((tone) => {
      const r = report[tone];
      if (!r.ok) console.warn(`  contrast ${t.id}/${mode}/${tone}: inverted ${r.inv.toFixed(2)}, text ${r.text.toFixed(2)}, strong ${r.strong.toFixed(2)}`);
    });
  }
  out.set(`tokens/dist/${t.id}.css`, themeCss(t));
  themes.push({ id: t.id, name: t.name, description: t.description || '', file: `tokens/themes/${f}`, css: `tokens/dist/${t.id}.css` });
}

// ---- Components
const components = [];
const ids = new Set();
for (const [dir, level] of LEVELS) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) continue;
  for (const id of fs.readdirSync(base).sort()) {
    const folder = path.join(base, id);
    if (!fs.statSync(folder).isDirectory()) continue;
    const need = ['component.json', 'component.html', 'component.css'];
    const missing = need.filter((n) => !fs.existsSync(path.join(folder, n)));
    if (missing.length) { errors.push(`${dir}/${id}: missing ${missing.join(', ')}`); continue; }
    const meta = readJson(path.join(folder, 'component.json'));
    if (!meta) continue;
    const where = `${dir}/${id}/component.json`;
    if (meta.id !== id) errors.push(`${where}: id "${meta.id}" must match folder "${id}"`);
    if (meta.level !== level) errors.push(`${where}: level must be "${level}"`);
    if (!STATUSES.includes(meta.status)) errors.push(`${where}: status must be ${STATUSES.join(' | ')}`);
    ['name', 'description', 'category'].forEach((k) => { if (!meta[k]) errors.push(`${where}: ${k} is required`); });
    Object.entries(meta.props || {}).forEach(([k, p]) => { if (!p.attr) errors.push(`${where}: props.${k}.attr is required`); });
    if (ids.has(id)) errors.push(`${where}: duplicate id`);
    ids.add(id);
    const hasJs = fs.existsSync(path.join(folder, 'component.js'));
    const examples = (meta.examples || []).map((e) => {
      const file = `${dir}/${id}/examples/${e.id}.html`;
      if (!e.id || !e.title) errors.push(`${where}: every example needs id and title`);
      else if (!fs.existsSync(path.join(root, file))) errors.push(`${where}: example file ${file} is missing`);
      return { id: e.id, title: e.title, description: e.description || '', file, ...(e.minHeight ? { minHeight: e.minHeight } : {}), ...(e.gap ? { gap: e.gap } : {}) };
    });
    components.push({
      id, name: meta.name, level, category: meta.category, status: meta.status,
      description: meta.description, useWhen: meta.useWhen || [], avoidWhen: meta.avoidWhen || [],
      keywords: meta.keywords || [], props: meta.props || {}, tokens: meta.tokens || [], uses: meta.uses || [],
      snippet: meta.snippet || '', parts: meta.parts || {}, examples,
      react: { component: componentName(id), element: meta.react?.element || 'div', className: meta.react?.className || 'es-' + id, defaults: meta.react?.defaults || {} },
      files: { html: `${dir}/${id}/component.html`, css: `${dir}/${id}/component.css`, ...(hasJs ? { js: `${dir}/${id}/component.js` } : {}), react: `integrations/react/${componentName(id)}.jsx` }
    });
    out.set(`integrations/react/${componentName(id)}.jsx`, jsxWrapper(meta));
  }
}
components.forEach((c) => c.uses.forEach((u) => { if (!ids.has(u)) errors.push(`${c.files.html}: uses unknown component "${u}"`); }));

const pkg = readJson(path.join(root, 'package.json'));
out.set('catalog/index.json', JSON.stringify({
  $comment: 'Generated by tools/build.js. Do not edit.',
  version: pkg?.version || '0.0.0',
  foundation: { css: 'foundation/base.css' },
  themes,
  components
}, null, 2) + '\n');

const index = components.map((c) => `export { ${componentName(c.id)} } from './${componentName(c.id)}.jsx';`).join('\n') + '\n';
out.set('integrations/react/index.js', '// Generated by tools/build.js. Do not edit.\n' + index);

if (errors.length) {
  console.error('Build failed:\n' + errors.map((e) => '  ✗ ' + e).join('\n'));
  process.exit(1);
}

// ---- Write or check
let stale = [];
for (const [file, content] of out) {
  const abs = path.join(root, file);
  const cur = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
  if (cur === content) continue;
  if (check) { stale.push(file); continue; }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}
// Remove generated React files whose component no longer exists.
const reactDir = path.join(root, 'integrations/react');
if (fs.existsSync(reactDir)) {
  for (const f of fs.readdirSync(reactDir)) {
    const p = `integrations/react/${f}`;
    if (!out.has(p)) { if (check) stale.push(p + ' (orphan)'); else fs.unlinkSync(path.join(reactDir, f)); }
  }
}

if (check) {
  if (stale.length) { console.error('Generated files are out of date. Run `npm run build`:\n' + stale.map((s) => '  • ' + s).join('\n')); process.exit(1); }
  console.log(`✓ up to date — ${themes.length} themes, ${components.length} components`);
} else {
  console.log(`✓ built — ${themes.length} themes, ${components.length} components`);
}
