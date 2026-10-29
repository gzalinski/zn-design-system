// Everything the viewer shows comes from the repo: catalog, themes, component sources.
import catalog from '../../catalog/index.json';
import baseCss from '../../foundation/base.css?raw';

const themeFiles = import.meta.glob('../../tokens/themes/*.json', { eager: true, import: 'default' });
const sources = import.meta.glob('../../{atoms,molecules,sections,layouts}/*/component.{html,css,js}', { eager: true, query: '?raw', import: 'default' });
const exampleFiles = import.meta.glob('../../{atoms,molecules,sections,layouts}/*/examples/*.html', { eager: true, query: '?raw', import: 'default' });
const react = import.meta.glob('../../integrations/react/*.jsx', { eager: true, query: '?raw', import: 'default' });

export const THEMES = Object.values(themeFiles).sort((a, b) => ['navy', 'yellow', 'green'].indexOf(a.id) - ['navy', 'yellow', 'green'].indexOf(b.id));
export const COMPONENTS = catalog.components;
export const BASE_CSS = baseCss;
export const VERSION = catalog.version;

const pick = (glob, file) => glob['../../' + file] || '';
export const source = (c) => ({
  html: pick(sources, c.files.html), css: pick(sources, c.files.css),
  js: c.files.js ? pick(sources, c.files.js) : '', jsx: pick(react, c.files.react)
});

export const exampleHtml = (e) => exampleFiles['../../' + e.file] || '';

export const LEVELS = [
  { id: 'atom', label: 'Atoms', route: 'atoms' },
  { id: 'molecule', label: 'Components', route: 'components' },
  { id: 'section', label: 'Sections', route: 'sections' },
  { id: 'layout', label: 'Layouts', route: 'layouts' }
];
export const FOUNDATION = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing & layout' },
  { id: 'shape', label: 'Radius & elevation' }
];

// CSS a preview needs: the component's own CSS plus every component it uses (recursively, deps first).
export const previewCss = (c, seen = new Set()) => {
  if (seen.has(c.id)) return '';
  seen.add(c.id);
  const deps = c.uses.map((u) => COMPONENTS.find((x) => x.id === u)).filter(Boolean).map((d) => previewCss(d, seen)).join('\n');
  return deps + '\n' + source(c).css;
};
