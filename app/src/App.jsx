import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Sun, Moon, Upload, Download, PanelRightClose, PanelRightOpen, Smartphone, Tablet, Laptop, Monitor,
  Copy, Check, ChevronRight, ChevronLeft, FileDown, Palette, Ruler, Shapes, ShieldCheck
} from 'lucide-react';
import { THEMES, COMPONENTS, LEVELS, FOUNDATION, VERSION, source, previewCss, exampleHtml } from './data.js';
import { htmlToJsx } from '../../lib/htmljsx.js';
import { themeCss, themeColors, validateTheme, TONES, DENSITIES, RADII } from '../../lib/tokens.js';
import { FOUNDATION_HTML } from './foundation.js';
import Preview from './Preview.jsx';

// ---------- small helpers
const store = {
  get(k, d) { try { const v = localStorage.getItem('es:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('es:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
};
const usePersist = (k, d) => {
  const [v, setV] = useState(() => store.get(k, d));
  useEffect(() => store.set(k, v), [k, v]);
  return [v, setV];
};
const useHash = () => {
  const [h, setH] = useState(() => location.hash.slice(1) || '/');
  useEffect(() => { const on = () => { setH(location.hash.slice(1) || '/'); document.querySelector('.main')?.scrollTo(0, 0); }; addEventListener('hashchange', on); return () => removeEventListener('hashchange', on); }, []);
  return h;
};
const download = (name, text, type) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
const STATUS_TONE = { stable: 'ok', draft: 'warn', deprecated: 'bad' };
const Status = ({ s }) => <span className={'status ' + STATUS_TONE[s]}>{s}</span>;

// ---------- app
export default function App() {
  const route = useHash();
  const [custom, setCustom] = usePersist('customThemes', []);
  const themes = useMemo(() => [...THEMES, ...custom], [custom]);
  const [themeId, setThemeId] = usePersist('theme', 'navy');
  const [edits, setEdits] = usePersist('toneEdits', {});
  const [mode, setMode] = usePersist('mode', 'light');
  const [density, setDensity] = usePersist('density', 'default');
  const [radius, setRadius] = usePersist('radius', 'soft');
  const [railOpen, setRailOpen] = usePersist('rail', true);
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const fileRef = useRef(null);

  const baseTheme = themes.find((t) => t.id === themeId) || themes[0];
  const theme = useMemo(() => ({ ...baseTheme, tones: { ...baseTheme.tones, ...(edits[baseTheme.id] || {}) }, density, radius }), [baseTheme, edits, density, radius]);
  const tokens = useMemo(() => themeCss(theme), [theme]);
  const ctx = { tokens, mode, density, radius, theme };

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { document.documentElement.dataset.app = mode; }, [mode]);

  const exportTheme = () => {
    const { ...out } = theme;
    download(`${theme.id}.json`, JSON.stringify(out, null, 2) + '\n', 'application/json');
  };
  const importTheme = async (file) => {
    try {
      const t = JSON.parse(await file.text());
      const errs = validateTheme(t);
      if (errs.length) { setToast('Import failed: ' + errs[0]); return; }
      setCustom((list) => [...list.filter((x) => x.id !== t.id), t]);
      setThemeId(t.id);
      setToast(`Imported "${t.name}"`);
    } catch (e) { setToast('Import failed: ' + e.message); }
  };

  // routing
  const [, section, arg] = route.split('/');
  let page;
  if (section === 'c' && COMPONENTS.find((c) => c.id === arg)) page = <Single c={COMPONENTS.find((c) => c.id === arg)} ctx={ctx} />;
  else if (section === 'foundation') page = <Foundation id={arg || 'colors'} ctx={ctx} />;
  else {
    const level = LEVELS.find((l) => l.route === section);
    page = <Library level={level} query={query} ctx={ctx} />;
  }

  return (
    <div className={'shell' + (railOpen ? '' : ' rail-closed')}>
      <Sidebar route={route} />
      <header className="top">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Search components" value={query} aria-label="Search components"
            onChange={(e) => { setQuery(e.target.value); if (section === 'c' || section === 'foundation') location.hash = '/'; }} />
        </label>
        <div className="top-actions">
          <div className="seg" role="group" aria-label="Mode">
            <button type="button" aria-pressed={mode === 'light'} onClick={() => setMode('light')}><Sun size={16} />Light</button>
            <button type="button" aria-pressed={mode === 'dark'} onClick={() => setMode('dark')}><Moon size={16} />Dark</button>
          </div>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}><Upload size={16} />Import</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { if (e.target.files[0]) importTheme(e.target.files[0]); e.target.value = ''; }} />
          <button type="button" className="btn primary" onClick={exportTheme}><Download size={16} />Export</button>
          <button type="button" className="btn icon" aria-label={railOpen ? 'Close settings panel' : 'Open settings panel'} aria-expanded={railOpen} onClick={() => setRailOpen(!railOpen)}>
            {railOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>
      </header>
      <main className="main">{page}</main>
      {railOpen && (
        <Rail
          themes={themes} theme={theme} themeId={baseTheme.id} setThemeId={setThemeId} mode={mode}
          setTone={(tone, hex) => setEdits((e) => ({ ...e, [baseTheme.id]: { ...(e[baseTheme.id] || {}), [tone]: hex } }))}
          resetTones={() => setEdits((e) => { const n = { ...e }; delete n[baseTheme.id]; return n; })}
          edited={!!edits[baseTheme.id]}
          density={density} setDensity={setDensity} radius={radius} setRadius={setRadius}
          downloadCss={() => download(`${theme.id}.css`, tokens, 'text/css')}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

// ---------- sidebar
function Sidebar({ route }) {
  const groups = [
    { n: 1, label: 'Foundation', items: FOUNDATION.map((f) => ({ href: '/foundation/' + f.id, label: f.label })) },
    ...LEVELS.map((l, i) => ({
      n: i + 2, label: l.label, href: '/' + l.route,
      items: COMPONENTS.filter((c) => c.level === l.id).map((c) => ({ href: '/c/' + c.id, label: c.name, status: c.status }))
    }))
  ];
  return (
    <nav className="side" aria-label="Design system">
      <a className="brand" href="#/"><span className="logo" aria-hidden="true">E</span><span><strong>Enspire</strong><small>Design System · v{VERSION}</small></span></a>
      {groups.map((g) => (
        <div className="group" key={g.label}>
          {g.href ? <a className={'group-title' + (route === g.href ? ' on' : '')} href={'#' + g.href}><span>{g.n}</span>{g.label}</a>
            : <p className="group-title"><span>{g.n}</span>{g.label}</p>}
          {g.items.map((it) => (
            <a key={it.href} href={'#' + it.href} className={'item' + (route === it.href ? ' on' : '')} aria-current={route === it.href ? 'page' : undefined}>
              {it.label}{it.status && it.status !== 'stable' && <i className={'dot ' + STATUS_TONE[it.status]} title={it.status} />}
            </a>
          ))}
        </div>
      ))}
    </nav>
  );
}

// ---------- library
const PER_PAGE = 12;
function Library({ level, query, ctx }) {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const q = query.trim().toLowerCase();
  const list = COMPONENTS.filter((c) => (!level || c.level === level.id) && (status === 'all' || c.status === status) &&
    (!q || [c.name, c.id, c.description, c.category, ...c.keywords].join(' ').toLowerCase().includes(q)));
  const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  useEffect(() => setPage(1), [level, status, q]);
  const shown = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return (
    <div className="page">
      <div className="page-head">
        <div><p className="eyebrow">Library</p><h1>{level ? level.label : 'All components'}</h1>
          <p className="lead">{list.length} {list.length === 1 ? 'item' : 'items'}{q && <> matching “{query}”</>}</p></div>
        <div className="seg" role="group" aria-label="Status filter">
          {['all', 'stable', 'draft', 'deprecated'].map((s) => <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}
        </div>
      </div>
      {shown.length === 0 ? <p className="empty">No components match. Try another word or clear the filter.</p> : (
        <div className="cards">
          {shown.map((c) => {
            const s = source(c);
            const big = c.level === 'section' || c.level === 'layout';
            return (
              <a key={c.id} className="card" href={'#/c/' + c.id}>
                <div className="thumb"><Preview html={s.html} css={previewCss(c)} {...ctx} fit={200} scale={big ? 0.42 : 0.8} pad={big ? 0 : 20} title={c.name + ' preview'} /></div>
                <div className="card-body">
                  <div className="card-row"><strong>{c.name}</strong><Status s={c.status} /></div>
                  <p>{c.description}</p>
                  <small>{c.category} · {c.level}</small>
                </div>
              </a>
            );
          })}
        </div>
      )}
      {pages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button type="button" className="btn icon" disabled={page === 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
          {Array.from({ length: pages }, (_, i) => <button key={i} type="button" className="btn" aria-current={page === i + 1 ? 'page' : undefined} onClick={() => setPage(i + 1)}>{i + 1}</button>)}
          <button type="button" className="btn icon" disabled={page === pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
        </nav>
      )}
    </div>
  );
}

// ---------- single
const VIEWPORTS = [['mobile', 375, Smartphone], ['tablet', 768, Tablet], ['laptop', 1280, Laptop], ['desktop', null, Monitor]];
function Single({ c, ctx }) {
  const [tab, setTab] = useState('preview');
  const [vp, setVp] = useState('desktop');
  const s = source(c);
  const level = LEVELS.find((l) => l.id === c.level);
  const tabs = ['preview', 'props', 'usage', 'code', 'tokens'];
  const width = VIEWPORTS.find((v) => v[0] === vp)[1];
  return (
    <div className="page">
      <p className="crumbs"><a href={'#/' + level.route}>{level.label}</a><ChevronRight size={14} aria-hidden="true" />{c.name}</p>
      <div className="page-head">
        <div><h1>{c.name} <Status s={c.status} /></h1><p className="lead">{c.description}</p></div>
      </div>
      <div className="tabs" role="tablist">
        {tabs.map((t) => <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>
      {tab === 'preview' && (<>
        <div className="vp-bar">
          <div className="seg" role="group" aria-label="Viewport">
            {VIEWPORTS.map(([id, w, Icon]) => <button key={id} type="button" aria-pressed={vp === id} onClick={() => setVp(id)} title={w ? w + 'px' : 'Full width'}><Icon size={16} /><span className="sr">{id}</span></button>)}
          </div>
          <small>{width ? width + 'px' : 'Full width'}</small>
        </div>
        {c.examples.length > 0
          ? <div className="examples">{c.examples.map((e) => <Example key={e.id} e={e} c={c} ctx={ctx} width={width} />)}</div>
          : <div className="panel"><div className="stage"><Preview html={s.html} css={previewCss(c)} js={s.js} {...ctx} width={width || '100%'} pad={c.level === 'atom' || c.level === 'molecule' ? 32 : 0} title={c.name} /></div></div>}
      </>)}
      {tab === 'props' && (
        Object.keys(c.props).length === 0 ? <p className="empty">No props. Use the HTML as shown; the look comes from tokens.</p> : (
          <table className="table"><thead><tr><th>Prop</th><th>Attribute</th><th>Values</th><th>Default</th></tr></thead>
            <tbody>{Object.entries(c.props).map(([k, p]) => <tr key={k}><td><code>{k}</code></td><td><code>{p.attr}</code></td><td>{p.values ? p.values.map((v) => <code key={v} className="chip">{v}</code>) : <code className="chip">boolean</code>}</td><td><code>{p.default == null ? "—" : String(p.default)}</code></td></tr>)}</tbody></table>
        )
      )}
      {tab === 'usage' && (
        <div className="usage">
          <div><h3 className="ok-t">Use when</h3><ul>{c.useWhen.map((u) => <li key={u}>{u}</li>)}</ul></div>
          <div><h3 className="bad-t">Avoid when</h3><ul>{c.avoidWhen.map((u) => <li key={u}>{u}</li>)}</ul></div>
          {c.uses.length > 0 && <div><h3>Uses</h3><p>{c.uses.map((u) => <a key={u} className="chip" href={'#/c/' + u}>{u}</a>)}</p></div>}
          {c.snippet && <div className="wide"><h3>Snippet</h3><Code text={c.snippet} /></div>}
        </div>
      )}
      {tab === 'code' && <CodeTabs files={[['HTML', s.html], ['CSS', s.css], ...(s.js ? [['JS', s.js]] : []), ['JSX', s.jsx]]} />}
      {tab === 'tokens' && <TokenList c={c} ctx={ctx} />}
    </div>
  );
}

// One example: title, description, Preview / HTML / JSX.
function Example({ e, c, ctx, width }) {
  const [view, setView] = useState('preview');
  const html = exampleHtml(e);
  const anchor = c.id + '-' + e.id;
  return (
    <section className="example" id={anchor}>
      <h2><a href={'#/c/' + c.id} onClick={(ev) => { ev.preventDefault(); document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }); }} aria-hidden="true">#</a>{e.title}</h2>
      {e.description && <p>{e.description}</p>}
      <div className="ex-tabs" role="tablist">
        {['preview', 'html', 'jsx'].map((v) => <button key={v} role="tab" type="button" aria-selected={view === v} onClick={() => setView(v)}>{v === 'preview' ? 'Preview' : v.toUpperCase()}</button>)}
      </div>
      <div className="ex-box">
        {view === 'preview' && <div className="ex-stage"><Preview html={`<div class="ex-row">${html}</div>`} css={previewCss(c) + '.ex-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center}'} {...ctx} width={width || '100%'} pad={40} title={e.title} /></div>}
        {view === 'html' && <Code text={html} />}
        {view === 'jsx' && <Code text={htmlToJsx(html, COMPONENTS)} />}
      </div>
    </section>
  );
}

function CodeTabs({ files }) {
  const [i, setI] = useState(0);
  return (
    <div className="panel">
      <div className="panel-bar"><div className="seg" role="group" aria-label="Language">{files.map(([n], k) => <button key={n} type="button" aria-pressed={i === k} onClick={() => setI(k)}>{n}</button>)}</div></div>
      <Code text={files[i][1]} />
    </div>
  );
}
function Code({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked */ } };
  return (
    <div className="code"><button type="button" className="btn icon copy" onClick={copy} aria-label="Copy code">{done ? <Check size={16} /> : <Copy size={16} />}</button><pre><code>{text.trim()}</code></pre></div>
  );
}
function TokenList({ c, ctx }) {
  const { vars } = themeColors(ctx.theme, ctx.mode);
  const rows = c.tokens.flatMap((t) => (t.includes('{tone}') ? TONES.slice(0, 1).map((tone) => t.replace('{tone}', tone)) : [t]));
  return (
    <table className="table"><thead><tr><th>Token</th><th>Value ({ctx.theme.name}, {ctx.mode})</th></tr></thead>
      <tbody>{rows.map((t) => <tr key={t}><td><code>{t}</code></td><td>{vars[t] ? <span className="swatch-row"><i style={{ background: vars[t] }} />{vars[t]}</span> : <span className="muted">size / effect token</span>}</td></tr>)}</tbody></table>
  );
}

// ---------- foundation
function Foundation({ id, ctx }) {
  const f = FOUNDATION.find((x) => x.id === id) || FOUNDATION[0];
  return (
    <div className="page">
      <p className="crumbs">Foundation<ChevronRight size={14} aria-hidden="true" />{f.label}</p>
      <div className="page-head"><div><h1>{f.label}</h1><p className="lead">Live values of {ctx.theme.name} in {ctx.mode} mode. Change them in the panel on the right.</p></div></div>
      <div className="panel"><Preview html={FOUNDATION_HTML[f.id]()} {...ctx} pad={28} title={f.label} /></div>
    </div>
  );
}

// ---------- right rail
function Rail({ themes, theme, themeId, setThemeId, mode, setTone, resetTones, edited, density, setDensity, radius, setRadius, downloadCss }) {
  const [tab, setTab] = usePersist('railTab', 'color');
  const report = themeColors(theme, mode).report;
  const failing = TONES.filter((t) => !report[t].ok).length;
  const tabs = [['color', 'Color', Palette], ['space', 'Space', Ruler], ['shape', 'Shape', Shapes], ['check', 'Check', ShieldCheck]];
  return (
    <aside className="rail" aria-label="Theme settings">
      <div className="rail-tabs" role="tablist">
        {tabs.map(([id, label, Icon]) => <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}><Icon size={16} />{label}{id === 'check' && failing > 0 && <i className="dot bad" />}</button>)}
      </div>
      <div className="rail-body">
        {tab === 'color' && (<>
          <label className="field"><span>Theme</span>
            <select value={themeId} onChange={(e) => setThemeId(e.target.value)}>{themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          </label>
          <p className="hint">{theme.description}</p>
          <div className="tones">
            {TONES.map((t) => (
              <label key={t} className="tone">
                <input type="color" value={theme.tones[t]} onChange={(e) => setTone(t, e.target.value.toUpperCase())} aria-label={t + ' color'} />
                <span>{t}</span><code>{theme.tones[t]}</code>
              </label>
            ))}
          </div>
          {edited && <button type="button" className="btn full" onClick={resetTones}>Reset colors</button>}
          <button type="button" className="btn full" onClick={downloadCss}><FileDown size={16} />Download tokens.css</button>
        </>)}
        {tab === 'space' && (<>
          <p className="label">Density</p>
          <div className="options">{Object.entries(DENSITIES).map(([d, h]) => (
            <button key={d} type="button" className="option" aria-pressed={density === d} onClick={() => setDensity(d)}><strong>{d}</strong><small>controls {h.join(' / ')}px</small></button>
          ))}</div>
          <p className="hint">Density scales spacing tokens and control heights. Section spacing stays 96 / 80 / 64px.</p>
        </>)}
        {tab === 'shape' && (<>
          <p className="label">Radius</p>
          <div className="options">{Object.entries(RADII).map(([r, v]) => (
            <button key={r} type="button" className="option" aria-pressed={radius === r} onClick={() => setRadius(r)}>
              <i className="shape" style={{ borderRadius: Math.min(v[0], 18) }} /><strong>{r}</strong><small>control {v[0] > 999 ? 'pill' : v[0] + 'px'} · card {v[7]}px</small></button>
          ))}</div>
        </>)}
        {tab === 'check' && (<>
          <p className="label">Contrast · WCAG 2.2 AA</p>
          <table className="table compact"><thead><tr><th>Tone</th><th>On fill</th><th>Text</th><th>Strong</th></tr></thead>
            <tbody>{TONES.map((t) => { const r = report[t]; return (
              <tr key={t}><td>{t}</td><td className={r.inv >= 4.5 ? 'ok-t' : 'bad-t'}>{r.inv.toFixed(1)}</td><td className={r.text >= 4.5 ? 'ok-t' : 'bad-t'}>{r.text.toFixed(1)}</td><td className={r.strong >= 3 ? 'ok-t' : 'bad-t'}>{r.strong.toFixed(1)}</td></tr>); })}</tbody></table>
          <p className="hint">Text and fill need 4.5:1, strong (borders, icons) needs 3:1.</p>
        </>)}
      </div>
    </aside>
  );
}
