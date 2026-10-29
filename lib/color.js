// Color math shared by tools/build.js and the viewer app.
// One input color per tone -> 9 roles, derived in OKLCH and checked for contrast (WCAG 2.2).

const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

export const isHex = (h) => typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h);

export const luminance = (h) => {
  const c = hexRgb(h).map(lin);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

export const contrast = (a, b) => {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

export const toOklch = (h) => {
  const [r, g, b] = hexRgb(h).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.sqrt(A * A + B * B), H: Math.atan2(B, A) };
};

const fromOklch = (L, C, H) => {
  const A = C * Math.cos(H), B = C * Math.sin(H);
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
  const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
  const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
};

// OKLCH -> hex, reducing chroma until the color fits in sRGB.
export const oklchHex = (L, C, H) => {
  L = Math.min(0.995, Math.max(0.01, L));
  let c = C, rgb = fromOklch(L, c, H), i = 0;
  while (i < 40 && rgb.some((x) => x < -0.0005 || x > 1.0005)) { c *= 0.9; rgb = fromOklch(L, c, H); i++; }
  return '#' + rgb
    .map((x) => Math.round(Math.min(1, Math.max(0, gam(Math.min(1, Math.max(0, x))))) * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

// The 9 roles of a tone. `surface` is the page surface the tone sits on (contrast target).
export const deriveTone = (hex, { dark = false, surface = '#FFFFFF' } = {}) => {
  const o = toOklch(hex), C = o.C, H = o.H;
  const white = '#FFFFFF', ink = oklchHex(0.17, Math.min(C, 0.04), H);
  const fills = (L) => {
    const bg = !dark && L === o.L ? hex.toUpperCase() : oklchHex(L, C, H);
    const hover = dark ? oklchHex(L + 0.05, C, H) : oklchHex(L - 0.06, C, H);
    const active = dark ? oklchHex(L - 0.05, C, H) : oklchHex(L - 0.12, C * 0.95, H);
    const minOf = (fg) => Math.min(contrast(fg, bg), contrast(fg, hover), contrast(fg, active));
    const w = minOf(white), k = minOf(ink);
    return { bg, hover, active, inv: w >= k ? white : ink, best: Math.max(w, k) };
  };
  // Keep the brand color when it passes; otherwise move L (darker for white text, lighter for ink) until AA.
  let L = dark ? Math.max(o.L, 0.65) : o.L, f = fills(L), n = 0;
  while (f.best < 4.5 && n < 30) { L += f.inv === white ? -0.02 : 0.02; f = fills(L); n++; }
  const { bg, hover, active } = f;
  const soft = dark ? oklchHex(0.22, Math.min(C * 0.4, 0.05), H) : oklchHex(0.97, Math.min(C * 0.15, 0.03), H);
  const surf = dark ? oklchHex(0.28, Math.min(C * 0.5, 0.07), H) : oklchHex(0.92, Math.min(C * 0.35, 0.06), H);
  const border = dark ? oklchHex(0.38, Math.min(C * 0.5, 0.08), H) : oklchHex(0.88, C * 0.4, H);

  let sL = dark ? 0.7 : 0.62, strong = oklchHex(sL, C, H); n = 0;
  while (contrast(strong, surface) < 3 && n < 40) { sL += dark ? 0.02 : -0.02; strong = oklchHex(sL, C, H); n++; }

  let tL = dark ? 0.86 : Math.min(o.L, 0.45), text = oklchHex(tL, C, H); n = 0;
  while (Math.min(contrast(text, surf), contrast(text, surface)) < 4.5 && n < 40) {
    tL += dark ? 0.02 : -0.02; text = oklchHex(tL, C, H); n++;
  }

  return {
    bg, 'bg-hover': hover, 'bg-active': active, text,
    'text-inverted': f.inv,
    soft, surface: surf, border, strong
  };
};

// The pairs the generator must keep above WCAG 2.2 AA. Returns one row per tone.
export const checkTone = (t, pageSurface) => {
  const inv = Math.min(contrast(t['text-inverted'], t.bg), contrast(t['text-inverted'], t['bg-hover']), contrast(t['text-inverted'], t['bg-active']));
  const text = Math.min(contrast(t.text, t.soft), contrast(t.text, t.surface), contrast(t.text, pageSurface));
  const strong = contrast(t.strong, pageSurface);
  return { inv, text, strong, ok: inv >= 4.5 && text >= 4.5 && strong >= 3 };
};
