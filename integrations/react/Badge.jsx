// Badge (atom) — generated from atoms/badge/component.json. Do not edit.
// Short label or status. Soft by default; data-status adds a dot and 14px text for important states (stock, order).
import React from 'react';

export function Badge({ className, tone = "primary", variant = "soft", status = false, size = "md", children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-badge', className].filter(Boolean).join(' '),
    'data-tone': tone && tone !== "primary" ? tone : undefined,
    'data-style': variant && variant !== "soft" ? variant : undefined,
    'data-status': status ? '' : undefined,
    'data-size': size && size !== "md" ? size : undefined,
  };
  return <span {...attrs}>{children}</span>;
}

export default Badge;
