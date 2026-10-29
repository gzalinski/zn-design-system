// Listing card (molecule) — generated from molecules/card/component.json. Do not edit.
// Card for a product, listing or course: media, status, title (style h4, tag h3), meta, price. The whole card is clickable via the title link.
import React from 'react';

export function Card({ className, children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-card', className].filter(Boolean).join(' '),

  };
  return <article {...attrs}>{children}</article>;
}

export default Card;
