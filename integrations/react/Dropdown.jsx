// Dropdown (molecule) — generated from molecules/dropdown/component.json. Do not edit.
// A button that shows a menu or any content. Three methods: details/summary (click, native), popover + anchor positioning (top layer), CSS focus (div tabindex). Placement with data-side and data-align.
import React from 'react';

export function Dropdown({ className, side = "bottom", align = "start", hover = false, open = false, close = false, children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-dropdown', className].filter(Boolean).join(' '),
    'data-side': side && side !== "bottom" ? side : undefined,
    'data-align': align && align !== "start" ? align : undefined,
    'data-hover': hover ? '' : undefined,
    'data-open': open ? '' : undefined,
    'data-close': close ? '' : undefined,
  };
  return <div {...attrs}>{children}</div>;
}

export default Dropdown;
