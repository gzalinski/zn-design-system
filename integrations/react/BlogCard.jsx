// Blog card (molecule) — generated from molecules/blog-card/component.json. Do not edit.
// Post teaser: rounded image, date / category meta line, title (style h5, tag h3) in the primary text tone. No border or padding; the whole card is clickable via the title link.
import React from 'react';

export function BlogCard({ className, children, ...rest }) {
  const attrs = {
    ...rest,
    className: ['es-blog-card', className].filter(Boolean).join(' '),

  };
  return <article {...attrs}>{children}</article>;
}

export default BlogCard;
