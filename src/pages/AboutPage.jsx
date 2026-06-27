import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast';

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => setToast({ msg, type }), []);
  return [toast, show, () => setToast(null)];
}

export default function AboutPage() {
  const [about, setAbout]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [newHighlight, setNewHighlight] = useState('');
  const [toast, showToast, closeToast] = useToast();

  useEffect(() => {
    api.getAbout()
      .then(res => setAbout(res.data))
      .catch(err => showToast(err.message, 'err'))
      .finally(() => setLoading(false));
  }, []);

  function addHighlight() {
    if (!newHighlight.trim()) return;
    setAbout({ ...about, highlights: [...(about.highlights || []), newHighlight.trim()] });
    setNewHighlight('');
  }

  function removeHighlight(i) {
    setAbout({ ...about, highlights: about.highlights.filter((_, idx) => idx !== i) });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAbout(about);
      showToast('About saved');
    } catch (err) { showToast(err.message, 'err'); }
    finally { setSaving(false); }
  }

  if (loading) return <div style={{ color: 'var(--muted)' }}>Loading…</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>About</h1>
      <div className="card">
        <form onSubmit={save}>
          <div className="field">
            <label>Bio</label>
            <textarea rows={5} value={about.bio || ''} onChange={e => setAbout({ ...about, bio: e.target.value })} />
          </div>

          <div className="field">
            <label>Highlights (At a Glance)</label>
            <div style={{ marginBottom: '.5rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
              {(about.highlights || []).map((h, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '.2rem .5rem .2rem .7rem', fontSize: 12 }}>
                  {h}
                  <button type="button" onClick={() => removeHighlight(i)} style={{ background: 'none', padding: '0 .15rem', color: 'var(--muted)', fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <input
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                placeholder="Add highlight…"
              />
              <button type="button" className="btn-ghost" onClick={addHighlight} style={{ flexShrink: 0 }}>Add</button>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save About'}
          </button>
        </form>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />}
    </div>
  );
}
