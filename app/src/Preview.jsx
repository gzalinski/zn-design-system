import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BASE_CSS } from './data.js';

// Renders canonical HTML + CSS in an isolated iframe, with the live tokens.css of the current theme.
// `fit` = fixed-height thumbnail (scaled), otherwise the frame grows with its content.
export default function Preview({ html, css = '', js = '', tokens, mode, density, radius, width, fit, scale = 1, pad = 24, title = 'Preview' }) {
  const ref = useRef(null);
  const [h, setH] = useState(fit || 160);
  const id = useMemo(() => Math.random().toString(36).slice(2), []);
  const doc = useMemo(() => `<!doctype html><html lang="en" data-es-mode="${mode}" data-es-density="${density}" data-es-radius="${radius}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${tokens}</style><style>${BASE_CSS}</style><style>${css}</style>
<style>html,body{background:var(--es-base-bg)}body{margin:0;padding:${pad}px;${scale !== 1 ? `zoom:${scale};` : ''}}${fit ? 'body{pointer-events:none;overflow:hidden}' : ''}</style></head>
<body>${html}<script>${js}</script><script>
const send=()=>parent.postMessage({esFrame:'${id}',h:Math.ceil(document.body.getBoundingClientRect().height)},'*');
new ResizeObserver(send).observe(document.body);addEventListener('load',send);
document.addEventListener('click',e=>{if(e.target.closest('a[href="#"]'))e.preventDefault();});
document.addEventListener('submit',e=>{if(e.target.getAttribute('action')==='#')e.preventDefault();});
</script></body></html>`, [html, css, js, tokens, mode, density, radius, fit, scale, pad, id]);

  useEffect(() => {
    if (fit) return;
    const on = (e) => { if (e.data?.esFrame === id) setH(Math.max(80, Math.ceil(e.data.h))); };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, [id, fit]);

  return (
    <iframe
      ref={ref}
      title={title}
      srcDoc={doc}
      className="frame"
      tabIndex={fit ? -1 : 0}
      style={{ height: fit || h, width: width || '100%' }}
    />
  );
}
