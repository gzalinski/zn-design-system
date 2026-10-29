// Pagination (molecule) — generated from molecules/pagination/component.json. Do not edit.
// Page links for listings. Wrap in nav with aria-label.
import React from 'react';

export function Pagination({ className, children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-pagination', className].filter(Boolean).join(' '),

  };
  return <ul {...attrs}>{children}</ul>;
}

export default Pagination;
