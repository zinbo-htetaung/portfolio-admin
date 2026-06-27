import { useState, useEffect } from 'react';
import { api } from '../api/client';

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '1.4rem 1rem' }}>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '.4rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '.2rem' }}>{sub}</div>}
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

export default function OverviewPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
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
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Overview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          {lastRefresh && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Updated {lastRefresh.toLocaleTimeString()}</span>}
          <button className="btn-ghost" onClick={load} style={{ padding: '.4rem .9rem', fontSize: 12 }}>↻ Refresh</button>
        </div>
      </div>

      {/* Status */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' }}>API Status</div>
          <Badge ok={health?.status === 'ok'} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' }}>Database</div>
          <Badge ok={health?.db === 'connected'} />
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <a href="https://zinbohtetaung.com" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
            ↗ View Portfolio
          </a>
        </div>
      </div>

      {/* Views */}
      <h2 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>
        Portfolio Views
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '.75rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Views" value={views.total ?? 0} />
        {Object.entries(sections).map(([section, count]) => (
          <StatCard key={section} label={section.charAt(0).toUpperCase() + section.slice(1)} value={count} sub="section" />
        ))}
        {Object.keys(sections).length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: 13, gridColumn: '1/-1' }}>No section data yet — views will appear as visitors browse.</div>
        )}
      </div>

      {/* Content */}
      <h2 style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.75rem' }}>
        Content
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '.75rem' }}>
        <StatCard label="Experience" value={counts.experience} sub="entries" />
        <StatCard label="Projects"   value={counts.projects}   sub="entries" />
        <StatCard label="Skills"     value={counts.skills}     sub="pills" />
        <StatCard label="Languages"  value={counts.languages}  sub="entries" />
        <StatCard label="Education"  value={counts.education}  sub="entries" />
      </div>
    </div>
  );
}
