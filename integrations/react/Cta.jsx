// CTA (section) — generated from sections/cta/component.json. Do not edit.
// Single call to action on a coloured surface. One CTA section per page.
import React from 'react';

export function Cta({ className, surface = "primary", children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-section es-cta', className].filter(Boolean).join(' '),
    'data-surface': surface && surface !== "primary" ? surface : undefined,
  };
  return <section {...attrs}>{children}</section>;
}

export default Cta;
