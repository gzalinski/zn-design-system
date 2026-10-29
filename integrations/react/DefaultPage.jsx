// Default page (layout) — generated from layouts/default-page/component.json. Do not edit.
// Page skeleton: sticky header, main of stacked sections, footer.
import React from 'react';

export function DefaultPage({ className, children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-page', className].filter(Boolean).join(' '),

  };
  return <div {...attrs}>{children}</div>;
}

export default DefaultPage;
