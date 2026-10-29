// Converts canonical example HTML into JSX that uses the generated React wrappers.
// Elements whose root class matches a catalog component become <Component prop="…">;
// everything else becomes plain JSX (className, style objects, camelCase SVG attributes).
// Works on the small, well-formed HTML of examples; it is not a general HTML parser.

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);
const RENAME = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', autocomplete: 'autoComplete', viewbox: 'viewBox', popovertarget: 'popoverTarget', popovertargetaction: 'popoverTargetAction' };
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const jsxName = (a) => RENAME[a] || (/^(aria|data)-/.test(a) ? a : a.includes('-') ? camel(a) : a);
const styleObj = (css) => '{{ ' + css.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
  const i = d.indexOf(':');
  const k = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
  return `${k.startsWith('--') ? `'${k}'` : camel(k)}: ${/^-?\d+(\.\d+)?$/.test(v) ? v : `'${v.replace(/'/g, "\\'")}'`}`;
}).join(', ') + ' }}';
const parseAttrs = (s) => {
  const out = [];
  s.replace(/([^\s=/]+)(?:="([^"]*)")?/g, (_, k, v) => { out.push([k, v]); return ''; });
  return out;
};
const attrJsx = ([k, v]) => {
  const n = jsxName(k);
  if (v === undefined) return n;
  if (k === 'style') return `style=${styleObj(v)}`;
  if (/^on[a-z]+$/.test(k)) return `on${k[2].toUpperCase()}${k.slice(3)}={() => ${v.replace(/;$/, '')}}`;
  return `${n}="${v}"`;
};

export const htmlToJsx = (html, components = []) => {
  const byClass = components
    .filter((c) => c.react)
    .map((c) => ({ ...c.react, root: c.react.className.split(' ').pop(), props: c.props || {} }));
  const used = new Set();
  const stack = [];
  const body = html.trim().replace(/<!--[\s\S]*?-->|<\/?([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g, (tag, name, rest, selfClose) => {
    if (tag.startsWith('<!--')) return `{/*${tag.slice(4, -3)}*/}`;
    if (tag.startsWith('</')) return `</${stack.pop() || name}>`;
    const attrs = parseAttrs(rest);
    const cls = (attrs.find(([k]) => k === 'class')?.[1] || '').split(/\s+/);
    const comp = byClass.find((c) => c.element === name && cls.includes(c.root));
    let out;
    if (comp) {
      used.add(comp.component);
      const props = [];
      const extra = cls.filter((c) => !comp.className.split(' ').includes(c));
      if (extra.length) props.push(`className="${extra.join(' ')}"`);
      attrs.forEach(([k, v]) => {
        if (k === 'class') return;
        if (comp.defaults[k] !== undefined && comp.defaults[k] === v) return;
        const prop = Object.entries(comp.props).find(([, p]) => p.attr === k);
        if (!prop) { props.push(attrJsx([k, v])); return; }
        const [pn, p] = prop;
        if (p.type === 'boolean') props.push(v === 'false' ? `${pn}={false}` : pn);
        else props.push(`${pn}="${v}"`);
      });
      out = { tag: comp.component, attrs: props };
    } else {
      out = { tag: name, attrs: attrs.map(attrJsx) };
    }
    const isVoid = selfClose === '/' || VOID.has(name.toLowerCase());
    const open = `<${out.tag}${out.attrs.length ? ' ' + out.attrs.join(' ') : ''}`;
    if (isVoid) return open + ' />';
    stack.push(out.tag);
    return open + '>';
  })
    // Self-closed void elements may have had a closing tag in source (e.g. </path>); drop those.
    .replace(/<\/(path|circle|rect|line|polyline|polygon|ellipse|input|img|br|hr)>/g, '');
  const imports = used.size ? `import { ${[...used].sort().join(', ')} } from './integrations/react';\n\n` : '';
  const indented = body.split('\n').map((l) => '    ' + l).join('\n');
  return `${imports}export default function Example() {\n  return (\n    <>\n${indented}\n    </>\n  );\n}\n`;
};
