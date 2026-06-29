import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const SITE_URL = 'https://zinbohtetaung.com';
const PSI_KEY  = import.meta.env.VITE_PSI_KEY || '';
const PSI_URL  = (strategy) =>
  `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(SITE_URL)}&strategy=${strategy}&category=performance&category=accessibility&category=seo&category=best-practices${PSI_KEY ? `&key=${PSI_KEY}` : ''}`;

// ── Helpers ────────────────────────────────────────────────────────

function scoreColor(n) {
  if (n >= 90) return 'var(--success)';
  if (n >= 50) return '#f0a050';
  return 'var(--danger)';
}

function ScoreRing({ score, label }) {
  const r = 34, circ = 2 * Math.PI * r;
  const pct = score == null ? 0 : Math.round(score);
  const dash = circ - (pct / 100) * circ;
  const color = score == null ? 'var(--border)' : scoreColor(pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem' }}>
      <svg width={84} height={84} viewBox="0 0 84 84">
        <circle cx={42} cy={42} r={r} fill="none" stroke="var(--border)" strokeWidth={7} />
        <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round" transform="rotate(-90 42 42)"
          style={{ transition: 'stroke-dashoffset .6s ease' }} />
        <text x={42} y={47} textAnchor="middle" fontSize={16} fontWeight={700}
          fill={score == null ? 'var(--muted)' : color}>
          {score == null ? '–' : pct}
        </text>
      </svg>
      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function MetricRow({ label, value, good }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '.45rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: good == null ? 'var(--text)' : good ? 'var(--success)' : 'var(--danger)' }}>
        {value ?? '–'}
      </span>
    </div>
  );
}

function PerformancePanel({ strategy }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [data, setData]   = useState(null);
  const [err, setErr]     = useState('');

  async function run() {
    setState('loading');
    setErr('');
    try {
      const res  = await fetch(PSI_URL(strategy));
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || `HTTP ${res.status}`);
      const lh   = json.lighthouseResult;
      const cat  = lh.categories;
      const aud  = lh.audits;
      setData({
        perf:         Math.round((cat.performance?.score        ?? 0) * 100),
        accessibility:Math.round((cat.accessibility?.score     ?? 0) * 100),
        seo:          Math.round((cat.seo?.score               ?? 0) * 100),
        bestPractices:Math.round((cat['best-practices']?.score ?? 0) * 100),
        fcp:  aud['first-contentful-paint']?.displayValue,
        lcp:  aud['largest-contentful-paint']?.displayValue,
        tbt:  aud['total-blocking-time']?.displayValue,
        cls:  aud['cumulative-layout-shift']?.displayValue,
        si:   aud['speed-index']?.displayValue,
        ttfb: aud['server-response-time']?.displayValue,
        fcpNum: (cat.performance?.score ?? 0),
        lcpNum: parseFloat(aud['largest-contentful-paint']?.numericValue ?? 9999) / 1000,
        clsNum: parseFloat(aud['cumulative-layout-shift']?.numericValue ?? 0.99),
      });
      setState('done');
    } catch (e) {
      setErr(e.message);
      setState('error');
    }
  }

  return (
    <div className="card" style={{ flex: 1, minWidth: 280 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '.9rem', fontWeight: 700, textTransform: 'capitalize' }}>
          {strategy === 'mobile' ? '📱 Mobile' : '🖥️ Desktop'}
        </h3>
        <button className="btn-ghost" onClick={run} disabled={state === 'loading' || !PSI_KEY}
          style={{ padding: '.35rem .8rem', fontSize: 12 }}
          title={!PSI_KEY ? 'Add VITE_PSI_KEY to Vercel env vars first' : ''}>
          {state === 'loading' ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Running…</> : '▶ Run Test'}
        </button>
      </div>

      {state === 'idle' && !PSI_KEY && (
        <div style={{ color: 'var(--danger)', fontSize: 13, padding: '1rem 0' }}>
          Add <code style={{ background: 'var(--surface2)', padding: '.1rem .35rem', borderRadius: 4 }}>VITE_PSI_KEY</code> to your Vercel environment variables to enable this.
          <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', marginTop: '.4rem', fontSize: 12 }}>Get a free API key →</a>
        </div>
      )}
      {state === 'idle' && PSI_KEY && (
        <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>
          Click "Run Test" to fetch live performance scores from Google PageSpeed Insights.
        </div>
      )}

      {state === 'error' && (
        <div style={{ color: 'var(--danger)', fontSize: 13 }}>Error: {err}</div>
      )}

      {state === 'loading' && (
        <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>
          Analysing {SITE_URL}… (takes ~10s)
        </div>
      )}

      {state === 'done' && data && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '.5rem' }}>
            <ScoreRing score={data.perf}          label="Performance" />
            <ScoreRing score={data.accessibility} label="Accessibility" />
            <ScoreRing score={data.bestPractices} label="Best Practices" />
            <ScoreRing score={data.seo}           label="SEO" />
          </div>
          <div>
            <MetricRow label="First Contentful Paint" value={data.fcp} good={data.fcpNum >= 0.9} />
            <MetricRow label="Largest Contentful Paint" value={data.lcp} good={data.lcpNum <= 2.5} />
            <MetricRow label="Total Blocking Time"    value={data.tbt} />
            <MetricRow label="Cumulative Layout Shift" value={data.cls} good={data.clsNum <= 0.1} />
            <MetricRow label="Speed Index"            value={data.si} />
            <MetricRow label="Server Response Time"   value={data.ttfb} />
          </div>
        </>
      )}
    </div>
  );
}

// ── Stat cards ─────────────────────────────────────────────────────

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1.2rem .8rem' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '12.5px', fontWeight: 600, marginTop: '.35rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '.15rem' }}>{sub}</div>}
    </div>
  );
}

function Badge({ ok }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '.35rem',
      background: ok ? 'rgba(76,175,125,.15)' : 'rgba(224,90,90,.15)',
      color: ok ? 'var(--success)' : 'var(--danger)',
      border: `1px solid ${ok ? 'var(--success)' : 'var(--danger)'}`,
      borderRadius: 20, padding: '.2rem .7rem', fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {ok ? 'Online' : 'Offline'}
    </span>
  );
}

// ── Visitor helpers ────────────────────────────────────────────────

function Chip({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '.25rem',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 20, padding: '.15rem .55rem', fontSize: 11.5, color: 'var(--text)',
    }}>
      {icon} {label}
    </span>
  );
}

function referrerLabel(ref) {
  if (!ref || ref === 'direct') return 'Direct';
  try {
    const host = new URL(ref).hostname.replace('www.', '');
    if (host.includes('linkedin'))  return 'LinkedIn';
    if (host.includes('google'))    return 'Google';
    if (host.includes('github'))    return 'GitHub';
    if (host.includes('facebook'))  return 'Facebook';
    if (host.includes('twitter') || host.includes('x.com')) return 'X / Twitter';
    return host;
  } catch { return ref; }
}

// ── Visitors panel ─────────────────────────────────────────────────

function VisitorsPanel() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('countries'); // 'countries' | 'recent'

  useEffect(() => {
    api.getVisitors()
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card" style={{ color: 'var(--muted)', fontSize: 13 }}>Loading visitor data…</div>;
  if (!data)   return <div className="card" style={{ color: 'var(--muted)', fontSize: 13 }}>No visitor data yet — data appears after the first real visit.</div>;

  const maxCount = data.countries[0]?.count || 1;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
        <div>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>{data.total}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: '.5rem' }}>total visitors tracked</span>
        </div>
        <div style={{ display: 'flex', gap: '.4rem' }}>
          {['countries', 'recent'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={tab === t ? 'btn-primary' : 'btn-ghost'}
              style={{ padding: '.3rem .75rem', fontSize: 12, textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'countries' && (
        <div>
          {data.countries.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No country data yet.</div>
          )}
          {data.countries.map(c => (
            <div key={c.country} style={{ marginBottom: '.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.2rem' }}>
                <span style={{ fontSize: 13 }}>{c.flag} {c.country}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{c.count}</span>
              </div>
              <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${(c.count / maxCount) * 100}%`,
                  height: '100%', borderRadius: 4,
                  background: 'var(--accent)',
                  transition: 'width .5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'recent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {data.recent.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No recent visits yet.</div>
          )}
          {data.recent.map((v, i) => (
            <div key={i} style={{
              background: 'var(--surface2)', borderRadius: 8,
              border: '1px solid var(--border)', padding: '.75rem 1rem',
              fontSize: 13,
            }}>
              {/* Row 1: location + time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.4rem' }}>
                <span style={{ fontWeight: 700 }}>{v.flag} {v.country}{v.city ? ` · ${v.city}` : ''}</span>
                <span style={{ color: 'var(--muted)', fontSize: 11 }}>{new Date(v.visitedAt).toLocaleString()}</span>
              </div>
              {/* Row 2: device info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '.35rem' }}>
                {v.device   && <Chip icon={v.device === 'Mobile' ? '📱' : v.device === 'Tablet' ? '📟' : '🖥️'} label={v.device} />}
                {v.browser  && <Chip icon="🌐" label={v.browser} />}
                {v.os       && <Chip icon="💻" label={v.os} />}
                {v.screen   && <Chip icon="📐" label={v.screen} />}
                {v.darkMode != null && <Chip icon={v.darkMode ? '🌙' : '☀️'} label={v.darkMode ? 'Dark mode' : 'Light mode'} />}
              </div>
              {/* Row 3: context */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                {v.referrer && v.referrer !== 'direct' && <Chip icon="🔗" label={referrerLabel(v.referrer)} />}
                {(!v.referrer || v.referrer === 'direct') && <Chip icon="✉️" label="Direct visit" />}
                {v.language  && <Chip icon="🗣️" label={v.language} />}
                {v.timezone  && <Chip icon="🕐" label={v.timezone} />}
                {v.isp       && <Chip icon="📡" label={v.isp} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Backup history ─────────────────────────────────────────────────

function BackupHistory() {
  const [backups, setBackups]   = useState([]);
  const [section, setSection]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.getBackups(section)
      .then(res => setBackups(res.data || []))
      .finally(() => setLoading(false));
  }, [section]);

  useEffect(load, [load]);

  async function viewDetail(id) {
    if (expanded === id) { setExpanded(null); setDetail(null); return; }
    setExpanded(id);
    setDetail(null);
    const res = await api.getBackup(id);
    setDetail(JSON.stringify(res.data, null, 2));
  }

  const sections = ['', 'profile', 'hero', 'about', 'education', 'experience', 'projects', 'skills'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Change History
        </h2>
        <select value={section} onChange={e => setSection(e.target.value)}
          style={{ width: 'auto', padding: '.3rem .6rem', fontSize: 12 }}>
          {sections.map(s => <option key={s} value={s}>{s || 'All sections'}</option>)}
        </select>
        <button className="btn-ghost" onClick={load} style={{ padding: '.3rem .7rem', fontSize: 12 }}>↻</button>
      </div>

      {loading && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Loading…</div>}

      {!loading && backups.length === 0 && (
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          No backups yet — created automatically before every save or delete.
        </div>
      )}

      {backups.map(b => (
        <div key={b.id} style={{ marginBottom: '.4rem' }}>
          <div className="list-item" style={{ cursor: 'pointer' }} onClick={() => viewDetail(b.id)}>
            <div className="info">
              <strong style={{ textTransform: 'capitalize' }}>{b.section}</strong>
              <span>{new Date(b.createdAt).toLocaleString()}</span>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{expanded === b.id ? '▲ hide' : '▼ view'}</span>
          </div>
          {expanded === b.id && (
            <pre style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '0 0 8px 8px', padding: '.8rem 1rem',
              fontSize: 11.5, overflowX: 'auto', color: 'var(--text)',
              maxHeight: 300, overflowY: 'auto', margin: 0,
            }}>
              {detail ?? 'Loading…'}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase',
      letterSpacing: '.07em', marginBottom: '.75rem', marginTop: '1.75rem' }}>
      {children}
    </h2>
  );
}

export default function OverviewPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  function load() {
    setLoading(true);
    api.getInsights()
      .then(res => { setData(res.data); setLastRefresh(new Date()); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (loading) return <div style={{ color: 'var(--muted)' }}>Loading insights…</div>;
  if (error)   return <div style={{ color: 'var(--danger)' }}>Error: {error}</div>;

  const { views, counts, health } = data;
  const sections = views.sections || {};

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Overview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          {lastRefresh && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Updated {lastRefresh.toLocaleTimeString()}</span>}
          <button className="btn-ghost" onClick={load} style={{ padding: '.4rem .9rem', fontSize: 12 }}>↻ Refresh</button>
        </div>
      </div>

      {/* Status bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' }}>API</div>
          <Badge ok={health?.status === 'ok'} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' }}>Database</div>
          <Badge ok={health?.db === 'connected'} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <a href={SITE_URL} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>↗ View Portfolio</a>
        </div>
      </div>

      {/* Views */}
      <SectionTitle>Portfolio Views</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '.65rem' }}>
        <StatCard label="Total Views" value={views.total ?? 0} />
        {Object.entries(sections).map(([sec, count]) => (
          <StatCard key={sec} label={sec.charAt(0).toUpperCase() + sec.slice(1)} value={count} sub="section" />
        ))}
        {Object.keys(sections).length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: 13, gridColumn: '1/-1' }}>No section data yet.</p>
        )}
      </div>

      {/* Content counts */}
      <SectionTitle>Content</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '.65rem' }}>
        <StatCard label="Experience" value={counts.experience} sub="entries" />
        <StatCard label="Projects"   value={counts.projects}   sub="entries" />
        <StatCard label="Skills"     value={counts.skills}     sub="pills" />
        <StatCard label="Languages"  value={counts.languages}  sub="entries" />
        <StatCard label="Education"  value={counts.education}  sub="entries" />
      </div>

      {/* Visitors */}
      <SectionTitle>Visitor Locations</SectionTitle>
      <VisitorsPanel />

      {/* Performance */}
      <SectionTitle>Page Performance — {SITE_URL}</SectionTitle>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <PerformancePanel strategy="desktop" />
        <PerformancePanel strategy="mobile" />
      </div>

      {/* History */}
      <SectionTitle>Change History</SectionTitle>
      <BackupHistory />
    </div>
  );
}
