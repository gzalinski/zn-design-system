// Section heading (section) — generated from sections/heading/component.json. Do not edit.
// Section intro: uppercase subtitle and display title (style display, tag h2) on the left, a short description bottom-aligned on the right. One markup for every heading style; each style is a data-style value.
import React from 'react';

export function Heading({ className, variant = "split", surface = "soft", children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-section es-heading', className].filter(Boolean).join(' '),
    'data-style': variant && variant !== "split" ? variant : undefined,
    'data-surface': surface && surface !== "soft" ? surface : undefined,
  };
  return <section {...attrs}>{children}</section>;
}

export default Heading;
