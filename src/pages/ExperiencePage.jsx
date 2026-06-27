import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast';

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => setToast({ msg, type }), []);
  return [toast, show, () => setToast(null)];
}

const EMPTY = { role: '', company: '', type: '', period: '', bullets: [], linkLabel: '', linkUrl: '', displayOrder: 0 };

function BulletList({ bullets, onChange }) {
  const [newBullet, setNewBullet] = useState('');

  function add() {
    if (!newBullet.trim()) return;
    onChange([...(bullets || []), newBullet.trim()]);
    setNewBullet('');
  }

  function remove(i) {
    onChange(bullets.filter((_, idx) => idx !== i));
  }

  return (
    <div className="field">
      <label>Bullets</label>
      <div style={{ marginBottom: '.5rem', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
        {(bullets || []).map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-start' }}>
            <span style={{ flex: 1, fontSize: 13, padding: '.4rem .7rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7 }}>{b}</span>
            <button type="button" className="btn-ghost" onClick={() => remove(i)} style={{ flexShrink: 0, padding: '.35rem .7rem' }}>×</button>
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

function ExperienceForm({ initial, onSave, onCancel }) {
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
          <label>Role</label>
          <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />
        </div>
        <div className="field">
          <label>Company</label>
          <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label>Type (e.g. Full-time)</label>
          <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
        </div>
        <div className="field">
          <label>Period</label>
          <input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="Jan 2023 – Present" />
        </div>
      </div>
      <BulletList bullets={form.bullets} onChange={bullets => setForm({ ...form, bullets })} />
      <div className="row">
        <div className="field">
          <label>Link Label (optional)</label>
          <input value={form.linkLabel || ''} onChange={e => setForm({ ...form, linkLabel: e.target.value })} placeholder="Visit Facebook Page" />
        </div>
        <div className="field">
          <label>Link URL (optional)</label>
          <input value={form.linkUrl || ''} onChange={e => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://…" />
        </div>
      </div>
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

export default function ExperiencePage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding]   = useState(false);
  const [toast, showToast, closeToast] = useToast();

  const reload = useCallback(() => {
    setLoading(true);
    api.getExperiences()
      .then(res => setItems(res.data || []))
      .catch(err => showToast(err.message, 'err'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  async function handleCreate(form) {
    try { await api.createExperience(form); showToast('Added'); setAdding(false); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  async function handleUpdate(id, form) {
    try { await api.updateExperience(id, form); showToast('Saved'); setEditing(null); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    try { await api.deleteExperience(id); showToast('Deleted'); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  return (
    <div>
      <div className="section-header">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Experience</h1>
        <button className="btn-primary" onClick={() => { setAdding(true); setEditing(null); }}>+ Add</button>
      </div>

      {adding && <ExperienceForm onSave={handleCreate} onCancel={() => setAdding(false)} />}

      {loading ? <div style={{ color: 'var(--muted)' }}>Loading…</div> : items.map(item =>
        editing === item.id ? (
          <ExperienceForm key={item.id} initial={item} onSave={f => handleUpdate(item.id, f)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={item.id} className="list-item">
            <div className="info">
              <strong>{item.role}</strong>
              <span>{item.company} · {item.period}</span>
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
