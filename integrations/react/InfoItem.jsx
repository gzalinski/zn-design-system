// Info item (molecule) — generated from molecules/info-item/component.json. Do not edit.
// Icon in a circle with a bold title and a text or link: contact details, opening hours, feature strips. Lists use es-info-list with data-cols.
import React from 'react';

export function InfoItem({ className, icon = "solid", tone = "primary", size = "md", cols = "auto", children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-info', className].filter(Boolean).join(' '),
    'data-style': icon && icon !== "solid" ? icon : undefined,
    'data-tone': tone && tone !== "primary" ? tone : undefined,
    'data-size': size && size !== "md" ? size : undefined,
    'data-cols': cols && cols !== "auto" ? cols : undefined,
  };
  return <div {...attrs}>{children}</div>;
}

export default InfoItem;
