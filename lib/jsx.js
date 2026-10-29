// Generates a thin React wrapper from a component.json.
// HTML + CSS stay canonical; the wrapper only maps props to the same classes and data-attributes.

const pascal = (id) => id.split('-').map((s) => s[0].toUpperCase() + s.slice(1)).join('');

export const jsxWrapper = (meta) => {
  const r = meta.react || {};
  const el = r.element || 'div';
  const name = pascal(meta.id);
  const props = Object.entries(meta.props || {});
  const names = props.map(([k]) => k);
  const lines = props.map(([k, p]) => {
    if (p.type === 'boolean') {
      return p.attr.startsWith('aria-')
        ? `    '${p.attr}': ${k} ? 'true' : 'false',`
        : `    '${p.attr}': ${k} ? '' : undefined,`;
    }
    return `    '${p.attr}': ${k} && ${k} !== ${JSON.stringify(p.default)} ? ${k} : undefined,`;
  });
  const defaults = Object.entries(r.defaults || {}).map(([k, v]) => `${k}: ${JSON.stringify(v)}`);
  const sig = ['className', ...names.map((k) => `${k} = ${JSON.stringify(props.find(([n]) => n === k)[1].default)}`), ...(r.void ? [] : ['children']), '...rest'];
  const body = r.void
    ? `<${el} {...attrs} />`
    : `<${el} {...attrs}>{children}</${el}>`;
  return `// ${meta.name} (${meta.level}) — generated from ${meta.level}s/${meta.id}/component.json. Do not edit.
// ${meta.description}
import React from 'react';

export function ${name}({ ${sig.join(', ')} }) {
  const attrs = {
${defaults.map((d) => `    ${d},`).join('\n')}${defaults.length ? '\n' : ''}    ...rest,
    className: ['${r.className || 'es-' + meta.id}', className].filter(Boolean).join(' '),
${lines.join('\n')}
  };
  return ${body};
}

export default ${name};
`;
};

export const componentName = pascal;
