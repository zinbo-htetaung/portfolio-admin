import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast';

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => setToast({ msg, type }), []);
  return [toast, show, () => setToast(null)];
}

const EMPTY = { name: '', year: '', tags: [], bullets: [], displayOrder: 0 };

function TagInput({ tags, onChange }) {
  const [newTag, setNewTag] = useState('');
  function add() {
    if (!newTag.trim()) return;
    onChange([...(tags || []), newTag.trim()]);
    setNewTag('');
  }
  return (
    <div className="field">
      <label>Tags</label>
      <div style={{ marginBottom: '.4rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
        {(tags || []).map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '.2rem .5rem .2rem .7rem', fontSize: 12 }}>
            {t}
            <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))} style={{ background: 'none', padding: '0 .15rem', color: 'var(--muted)', fontSize: 14 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())} placeholder="Add tag…" />
        <button type="button" className="btn-ghost" onClick={add} style={{ flexShrink: 0 }}>Add</button>
      </div>
    </div>
  );
}

function BulletList({ bullets, onChange }) {
  const [newBullet, setNewBullet] = useState('');
  function add() {
    if (!newBullet.trim()) return;
    onChange([...(bullets || []), newBullet.trim()]);
    setNewBullet('');
  }
  return (
    <div className="field">
      <label>Bullets</label>
      <div style={{ marginBottom: '.5rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
        {(bullets || []).map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
            <span style={{ flex: 1, fontSize: 13, padding: '.4rem .7rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7 }}>{b}</span>
            <button type="button" className="btn-ghost" onClick={() => onChange(bullets.filter((_, idx) => idx !== i))} style={{ flexShrink: 0, padding: '.35rem .7rem' }}>×</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <textarea rows={2} value={newBullet} onChange={e => setNewBullet(e.target.value)} placeholder="Add bullet…" style={{ minHeight: 'unset' }} />
        <button type="button" className="btn-ghost" onClick={add} style={{ flexShrink: 0, alignSelf: 'flex-end' }}>Add</button>
      </div>
    </div>
  );
}

function ProjectForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: '1rem' }}>
      <div className="row">
        <div className="field">
          <label>Project Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field">
          <label>Year</label>
          <input value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} placeholder="2024" />
        </div>
      </div>
      <TagInput tags={form.tags} onChange={tags => setForm({ ...form, tags })} />
      <BulletList bullets={form.bullets} onChange={bullets => setForm({ ...form, bullets })} />
      <div className="field" style={{ maxWidth: 120 }}>
        <label>Display Order</label>
        <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Save'}</button>
        {onCancel && <button className="btn-ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default function ProjectsPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding]   = useState(false);
  const [toast, showToast, closeToast] = useToast();

  const reload = useCallback(() => {
    setLoading(true);
    api.getProjects()
      .then(res => setItems(res.data || []))
      .catch(err => showToast(err.message, 'err'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  async function handleCreate(form) {
    try { await api.createProject(form); showToast('Added'); setAdding(false); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  async function handleUpdate(id, form) {
    try { await api.updateProject(id, form); showToast('Saved'); setEditing(null); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project?')) return;
    try { await api.deleteProject(id); showToast('Deleted'); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  return (
    <div>
      <div className="section-header">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Projects</h1>
        <button className="btn-primary" onClick={() => { setAdding(true); setEditing(null); }}>+ Add</button>
      </div>

      {adding && <ProjectForm onSave={handleCreate} onCancel={() => setAdding(false)} />}

      {loading ? <div style={{ color: 'var(--muted)' }}>Loading…</div> : items.map(item =>
        editing === item.id ? (
          <ProjectForm key={item.id} initial={item} onSave={f => handleUpdate(item.id, f)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={item.id} className="list-item">
            <div className="info">
              <strong>{item.name}</strong>
              <span>{item.year} · {(item.tags || []).join(', ')}</span>
            </div>
            <div className="actions">
              <button className="btn-ghost" onClick={() => { setEditing(item.id); setAdding(false); }}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
            </div>
          </div>
        )
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />}
    </div>
  );
}
