// Checkbox (atom) — generated from atoms/checkbox/component.json. Do not edit.
// Checkbox or radio with its label. The whole label is clickable (touch target ≥ 44px with padding).
import React from 'react';

export function Checkbox({ className, children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-checkbox', className].filter(Boolean).join(' '),

  };
  return <label {...attrs}>{children}</label>;
}

export default Checkbox;
