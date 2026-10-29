// Button (atom) — generated from atoms/button/component.json. Do not edit.
// Triggers an action that changes state: submit, add to cart, enrol. One fill button per section.
import React from 'react';

export function Button({ className, tone = "primary", variant = "fill", size = "md", full = false, children, ...rest }) {
  const attrs = {
    type: "button",
    ...rest,
    className: ['es-button', className].filter(Boolean).join(' '),
    'data-tone': tone && tone !== "primary" ? tone : undefined,
    'data-style': variant && variant !== "fill" ? variant : undefined,
    'data-size': size && size !== "md" ? size : undefined,
    'data-full': full ? '' : undefined,
  };
  return <button {...attrs}>{children}</button>;
}

export default Button;
