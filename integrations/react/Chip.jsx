// Chip (atom) — generated from atoms/chip/component.json. Do not edit.
// Toggleable filter or removable selection. State lives in aria-pressed.
import React from 'react';

export function Chip({ className, pressed = false, children, ...rest }) {
  const attrs = {
    type: "button",
    ...rest,
    className: ['es-chip', className].filter(Boolean).join(' '),
    'aria-pressed': pressed ? 'true' : 'false',
  };
  return <button {...attrs}>{children}</button>;
}

export default Chip;
