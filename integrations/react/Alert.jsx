// Alert (molecule) — generated from molecules/alert/component.json. Do not edit.
// Inline message with icon, title and text. Info by default; tone sets meaning.
import React from 'react';

export function Alert({ className, tone = "info", children, ...rest }) {
  const attrs = {
    role: "status",
    ...rest,
    className: ['es-alert', className].filter(Boolean).join(' '),
    'data-tone': tone && tone !== "info" ? tone : undefined,
  };
  return <div {...attrs}>{children}</div>;
}

export default Alert;
