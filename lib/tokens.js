// Token generation shared by tools/build.js (writes tokens/dist/*.css) and the viewer app (live preview).
// A theme JSON holds only inputs; everything else is derived here.

import { deriveTone, checkTone, isHex } from './color.js';

export const TONES = ['primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error', 'neutral'];
export const ROLES = ['bg', 'bg-hover', 'bg-active', 'text', 'text-inverted', 'soft', 'surface', 'border', 'strong'];
export const BASE_KEYS = ['bg', 'surface', 'surface-hover', 'elevated', 'text-primary', 'text-secondary', 'text-tertiary',
  'border-subtle', 'border-default', 'border-strong', 'disabled-bg', 'disabled-text'];
export const MODES = ['light', 'dark'];
export const DENSITIES = { compact: [28, 36, 44], default: [32, 40, 48], comfortable: [36, 44, 52] };
// control, check, badge, tag, chip, image, table, card, dropdown, toast, modal
export const RADIUS_ROLES = ['control', 'check', 'badge', 'tag', 'chip', 'image', 'table', 'card', 'dropdown', 'toast', 'modal'];
export const RADII = {
  sharp: [2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4],
  soft: [8, 4, 4, 9999, 9999, 8, 8, 12, 12, 12, 16],
  round: [9999, 6, 9999, 9999, 9999, 16, 16, 20, 16, 16, 24]
};
export const BREAKPOINTS = { tablet: 768, desktop: 1024, wide: 1440 };

// [token, desktop, tablet, mobile]
export const LAYOUT = [
  ['section-space', 96, 80, 64],
  ['section-space-compact', 64, 48, 40],
  ['section-space-xl', 128, 96, 72],
  ['section-gap', 64, 48, 40],
  ['layout-gap', 64, 48, 40],
  ['section-header-gap', 48, 40, 32],
  ['gutter', 32, 24, 16],
  ['header-height', 80, 72, 64],
  ['listing-gap', 24, 20, 16],
  ['list-item-gap', 16, 12, 12],
  ['filter-gap', 16, 12, 8],
  ['field-group-gap', 32, 24, 24],
  ['form-gap', 20, 20, 16],
  ['space-safe', 24, 16, 16]
];

const SPACE = { '0': 0, '025': 2, '050': 4, '075': 6, '100': 8, '150': 12, '200': 16, '250': 20, '300': 24, '400': 32, '500': 40, '600': 48, '800': 64, '1000': 80, '1200': 96, '1600': 128 };

// [style, desktop px, tablet px, mobile px, line-height, weight]
export const HEADINGS = [
  ['display', 56, 48, 40, 1.1, 700], ['h1', 48, 40, 32, 1.1, 700], ['h2', 36, 32, 28, 1.2, 700],
  ['h3', 28, 24, 22, 1.25, 600], ['h4', 22, 20, 20, 1.3, 600], ['h5', 18, 18, 18, 1.4, 600], ['h6', 16, 16, 16, 1.4, 600]
];
export const TEXT_STYLES = [
  ['body-lg', 18, 1.6, 400], ['body-md', 16, 1.5, 400], ['body-sm', 14, 1.5, 400], ['body-xs', 13, 1.4, 400],
  ['label', 14, 1.3, 500], ['helper', 14, 1.5, 400], ['meta', 13, 1.4, 400], ['badge', 13, 1.3, 600],
  ['price-lg', 32, 1.2, 700], ['price-md', 20, 1.2, 700], ['table-header', 14, 1.4, 600], ['table-cell', 14, 1.4, 400]
];

// Validate a theme file; returns a list of problems (empty = valid).
export const validateTheme = (t) => {
  const errs = [];
  if (!t || typeof t !== 'object') return ['theme is not an object'];
  if (!t.id || !/^[a-z0-9-]+$/.test(t.id)) errs.push('id must be kebab-case');
  if (!t.name) errs.push('name is required');
  TONES.forEach((k) => { if (!isHex(t.tones?.[k])) errs.push(`tones.${k} must be a #RRGGBB color`); });
  MODES.forEach((m) => BASE_KEYS.forEach((k) => { if (!isHex(t.base?.[m]?.[k])) errs.push(`base.${m}.${k} must be a #RRGGBB color`); }));
  if (t.density && !DENSITIES[t.density]) errs.push('density must be compact | default | comfortable');
  if (t.radius && !RADII[t.radius]) errs.push('radius must be sharp | soft | round');
  return errs;
};

// All color variables of one theme in one mode, as { '--es-…': '#hex' }, plus the contrast report.
export const themeColors = (theme, mode = 'light') => {
  const base = theme.base[mode];
  const vars = {};
  BASE_KEYS.forEach((k) => {
    const name = k.startsWith('text-') || k.startsWith('border-') || k.startsWith('disabled-') ? k : 'base-' + k;
    vars['--es-' + name] = base[k];
  });
  const report = {};
  TONES.forEach((tone) => {
    const roles = deriveTone(theme.tones[tone], { dark: mode === 'dark', surface: base.surface });
    Object.assign(roles, theme.overrides?.[mode]?.[tone] || {});
    ROLES.forEach((r) => { vars[`--es-${tone}-${r}`] = roles[r]; });
    report[tone] = checkTone(roles, base.surface);
  });
  const g = theme.overrides?.[mode]?.global || {};
  vars['--es-link'] = g.link || vars['--es-primary-text'];
  vars['--es-focus-ring-color'] = g.focus || vars['--es-primary-strong'];
  vars['--es-border-focus'] = vars['--es-focus-ring-color'];
  vars['--es-disabled-border'] = base['border-subtle'];
  vars['--es-overlay'] = mode === 'dark' ? 'rgb(0 0 0 / 0.6)' : 'rgb(10 15 25 / 0.48)';
  vars['--es-skeleton-bg'] = base['surface-hover'];
  vars['--es-skeleton-shimmer'] = base.surface;
  return { vars, report };
};

const block = (sel, vars, indent = '  ') => `${sel} {\n${Object.entries(vars).map(([k, v]) => `${indent}${k}: ${v};`).join('\n')}\n}\n`;

const staticVars = (theme) => {
  const v = {
    '--es-font-text': theme.fonts?.text || "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    '--es-font-heading': theme.fonts?.heading || theme.fonts?.text || "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    '--es-font-mono': theme.fonts?.mono || "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    '--es-measure': '68ch',
    '--es-focus-ring-width': '2px',
    '--es-focus-ring-offset': '2px',
    '--es-container': '1280px',
    '--es-container-narrow': '768px',
    '--es-container-wide': '1440px',
    '--es-sidebar-width': '280px',
    '--es-sidebar-gap': '48px',
    '--es-table-min-width': '640px',
    '--es-sticky-offset': 'var(--es-header-height)',
    '--es-sticky-filter-height': '56px',
    '--es-grid-gap-2': '32px', '--es-grid-gap-3': '24px', '--es-grid-gap-4': '20px', '--es-grid-gap-6': '16px',
    '--es-duration-fast': '120ms', '--es-duration-base': '200ms', '--es-duration-slow': '300ms',
    '--es-ease-standard': 'cubic-bezier(0.2, 0, 0, 1)', '--es-ease-enter': 'cubic-bezier(0, 0, 0, 1)', '--es-ease-exit': 'cubic-bezier(0.3, 0, 1, 1)',
    '--es-z-base': '0', '--es-z-sticky': '100', '--es-z-dropdown': '200', '--es-z-drawer': '300', '--es-z-modal': '400', '--es-z-tooltip': '450', '--es-z-toast': '500',
    '--es-elevation-flat': 'none',
    '--es-elevation-raised-sm': '0 1px 2px rgb(16 24 40 / 0.04), 0 2px 6px rgb(16 24 40 / 0.06)',
    '--es-elevation-raised-md': '0 2px 4px rgb(16 24 40 / 0.04), 0 4px 12px rgb(16 24 40 / 0.08)',
    '--es-elevation-raised-lg': '0 16px 40px rgb(16 24 40 / 0.16)',
    '--es-elevation-sticky': '0 4px 12px rgb(16 24 40 / 0.06)'
  };
  Object.entries(SPACE).forEach(([k, px]) => { v[`--es-space-${k}`] = `calc(${px}px * var(--es-density, 1))`; });
  TEXT_STYLES.forEach(([n, px, lh, w]) => { v[`--es-${n}-size`] = `${px}px`; v[`--es-${n}-leading`] = String(lh); v[`--es-${n}-weight`] = String(w); });
  HEADINGS.forEach(([n, , , , lh, w]) => { v[`--es-${n}-leading`] = String(lh); v[`--es-${n}-weight`] = String(w); });
  return v;
};

const densityVars = (d) => ({ '--es-density': { compact: 0.875, default: 1, comfortable: 1.125 }[d], '--es-control-height-sm': DENSITIES[d][0] + 'px', '--es-control-height-md': DENSITIES[d][1] + 'px', '--es-control-height-lg': DENSITIES[d][2] + 'px' });
const radiusVars = (r) => Object.fromEntries(RADIUS_ROLES.map((role, i) => ['--es-radius-' + role, RADII[r][i] + 'px']));
const layoutVars = (col) => Object.fromEntries(LAYOUT.map((row) => ['--es-' + row[0], row[col] + 'px']));
const headingVars = (col) => Object.fromEntries(HEADINGS.map((row) => [`--es-${row[0]}-size`, row[col] + 'px']));

// The complete tokens.css for one theme.
export const themeCss = (theme) => {
  const light = themeColors(theme, 'light').vars, dark = themeColors(theme, 'dark').vars;
  const density = theme.density || 'default', radius = theme.radius || 'soft';
  let css = `/* ${theme.name} — generated by tools/build.js from tokens/themes/${theme.id}.json. Do not edit. */\n\n`;
  css += block(':root', { ...staticVars(theme), ...densityVars(density), ...radiusVars(radius), ...layoutVars(3), ...headingVars(3), ...light });
  css += `\n@media (min-width: ${BREAKPOINTS.tablet}px) {\n${block('  :root', { ...layoutVars(2), ...headingVars(2) }, '    ')}}\n`;
  css += `\n@media (min-width: ${BREAKPOINTS.desktop}px) {\n${block('  :root', { ...layoutVars(1), ...headingVars(1), '--es-sidebar-width': '280px' }, '    ')}}\n`;
  css += `\n@media (min-width: ${BREAKPOINTS.wide}px) {\n${block('  :root', { '--es-sidebar-width': '320px' }, '    ')}}\n`;
  css += '\n/* Dark mode: off by default on sites, enabled per project with data-es-mode="dark" on <html>. */\n';
  css += block('[data-es-mode="dark"]', dark);
  css += '\n/* data-surface="inverse" reuses the dark values inside one section. */\n';
  css += block('[data-surface="inverse"]', dark);
  Object.keys(DENSITIES).forEach((d) => { css += '\n' + block(`[data-es-density="${d}"]`, densityVars(d)); });
  Object.keys(RADII).forEach((r) => { css += '\n' + block(`[data-es-radius="${r}"]`, radiusVars(r)); });
  return css;
};

// Live variant for the app: one mode, one density, one radius, desktop layout values.
export const liveVars = (theme, { mode = 'light', density = 'default', radius = 'soft' } = {}) => ({
  ...staticVars(theme), ...densityVars(density), ...radiusVars(radius), ...layoutVars(1), ...headingVars(1), ...themeColors(theme, mode).vars
});

export const varsToCss = (vars, sel = ':root') => block(sel, vars);
