// Hero (section) — generated from sections/hero/component.json. Do not edit.
// Opening section: overline, display title (h1), lead, two actions, media. Uses section-space-xl.
import React from 'react';

export function Hero({ className, surface = "base", children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-section es-hero', className].filter(Boolean).join(' '),
    'data-surface': surface && surface !== "base" ? surface : undefined,
  };
  return <section {...attrs}>{children}</section>;
}

export default Hero;
