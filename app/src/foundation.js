// HTML for the Foundation pages. Rendered in the same iframe as components, so it uses the real tokens.
import { TONES, ROLES, HEADINGS, TEXT_STYLES, LAYOUT, RADIUS_ROLES } from '../../lib/tokens.js';

const sw = (v, label) => `<div style="display:flex;flex-direction:column;gap:4px;min-width:0"><div style="height:44px;border-radius:6px;background:var(${v});border:1px solid var(--es-border-subtle)"></div><code style="font:11px/1.3 var(--es-font-mono);color:var(--es-text-tertiary);overflow:hidden;text-overflow:ellipsis">${label}</code></div>`;

export const colorsHtml = () => `
<div style="display:flex;flex-direction:column;gap:28px">
${TONES.map((t) => `<div><p class="es-h6" style="margin:0 0 10px;text-transform:capitalize">${t}</p>
<div style="display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:8px">${ROLES.map((r) => sw(`--es-${t}-${r}`, r)).join('')}</div></div>`).join('')}
<div><p class="es-h6" style="margin:0 0 10px">Base &amp; text</p>
<div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px">${['base-bg', 'base-surface', 'base-surface-hover', 'base-elevated', 'text-primary', 'text-secondary', 'text-tertiary', 'border-subtle', 'border-default', 'border-strong', 'disabled-bg', 'disabled-text'].map((k) => sw('--es-' + k, k)).join('')}</div></div>
</div>`;

export const typographyHtml = () => `
<div style="display:flex;flex-direction:column;gap:20px">
${HEADINGS.map(([n, d, t, m]) => `<div style="display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:baseline;border-bottom:1px solid var(--es-border-subtle);padding-bottom:16px">
<code style="font:12px/1.4 var(--es-font-mono);color:var(--es-text-tertiary)">${n}<br>${d} / ${t} / ${m}</code><p class="es-${n}" style="margin:0">Cars ready to ship</p></div>`).join('')}
${TEXT_STYLES.map(([n, px, lh, w]) => `<div style="display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:baseline">
<code style="font:12px/1.4 var(--es-font-mono);color:var(--es-text-tertiary)">${n}<br>${px}px · ${lh} · ${w}</code><p style="margin:0;font:var(--es-${n}-weight) var(--es-${n}-size)/var(--es-${n}-leading) var(--es-font-text)">Every car gets a full inspection and complete export paperwork.</p></div>`).join('')}
</div>`;

export const spacingHtml = () => `
<table style="width:100%;border-collapse:collapse;font:14px/1.4 var(--es-font-text)">
<thead><tr style="text-align:left;color:var(--es-text-tertiary)"><th style="padding:8px">Token</th><th>Desktop ≥1024</th><th>Tablet ≥768</th><th>Mobile</th><th style="width:40%">Live value</th></tr></thead>
<tbody>${LAYOUT.map(([n, d, t, m]) => `<tr style="border-top:1px solid var(--es-border-subtle)"><td style="padding:8px"><code>--es-${n}</code></td><td>${d}</td><td>${t}</td><td>${m}</td>
<td><div style="height:10px;width:var(--es-${n});max-width:100%;background:var(--es-primary-bg);border-radius:2px"></div></td></tr>`).join('')}</tbody></table>`;

export const shapeHtml = () => `
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px">
${RADIUS_ROLES.map((r) => `<div style="display:flex;flex-direction:column;gap:8px"><div style="height:72px;background:var(--es-primary-soft);border:1px solid var(--es-primary-border);border-radius:var(--es-radius-${r})"></div><code style="font:12px var(--es-font-mono);color:var(--es-text-tertiary)">radius-${r}</code></div>`).join('')}
</div>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:24px;margin-top:32px">
${['flat', 'raised-sm', 'raised-md', 'raised-lg', 'sticky'].map((e) => `<div style="height:96px;display:grid;place-items:center;background:var(--es-base-surface);border-radius:var(--es-radius-card);box-shadow:var(--es-elevation-${e});border:1px solid var(--es-border-subtle)"><code style="font:12px var(--es-font-mono)">elevation-${e}</code></div>`).join('')}
</div>`;

export const FOUNDATION_HTML = { colors: colorsHtml, typography: typographyHtml, spacing: spacingHtml, shape: shapeHtml };
