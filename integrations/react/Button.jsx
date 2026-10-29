// Button (atom) — generated from atoms/button/component.json. Do not edit.
// Triggers an action that changes state: submit, add to cart, enrol. Supports icons (leading, trailing, icon-only square or circle), a loading state and a split layout with a separate icon part. One fill button per section.
import React from 'react';

export function Button({ className, tone = "primary", variant = "fill", size = "md", full = false, shape = null, loading = false, split = null, children, ...rest }) {
  const attrs = {
    type: "button",
    ...rest,
    className: ['es-button', className].filter(Boolean).join(' '),
    'data-tone': tone && tone !== "primary" ? tone : undefined,
    'data-style': variant && variant !== "fill" ? variant : undefined,
    'data-size': size && size !== "md" ? size : undefined,
    'data-full': full ? '' : undefined,
    'data-shape': shape && shape !== null ? shape : undefined,
    'aria-busy': loading ? 'true' : 'false',
    'data-split': split && split !== null ? split : undefined,
  };
  return <button {...attrs}>{children}</button>;
}

export default Button;
