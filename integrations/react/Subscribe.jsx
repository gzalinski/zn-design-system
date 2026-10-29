// Subscribe form (molecule) — generated from molecules/subscribe/component.json. Do not edit.
// Newsletter sign-up: email field and submit button, with optional intro, consent checkbox and result message. Layouts: inline (default), inset (button inside the field), stacked.
import React from 'react';

export function Subscribe({ className, layout = "inline", size = "md", children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-subscribe', className].filter(Boolean).join(' '),
    'data-layout': layout && layout !== "inline" ? layout : undefined,
    'data-size': size && size !== "md" ? size : undefined,
  };
  return <form {...attrs}>{children}</form>;
}

export default Subscribe;
