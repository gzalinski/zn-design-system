// Input (atom) — generated from atoms/input/component.json. Do not edit.
// Single-line text field. Use inside Form field for label, helper and error text.
import React from 'react';

export function Input({ className, size = "md", invalid = false, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-input', className].filter(Boolean).join(' '),
    'data-size': size && size !== "md" ? size : undefined,
    'aria-invalid': invalid ? 'true' : 'false',
  };
  return <input {...attrs} />;
}

export default Input;
