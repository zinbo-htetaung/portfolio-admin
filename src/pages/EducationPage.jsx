import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast';

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => setToast({ msg, type }), []);
  return [toast, show, () => setToast(null)];
}

const EMPTY = { institution: '', degree: '', period: '', coursework: [], displayOrder: 0 };

function EducationForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [newCourse, setNewCourse] = useState('');
  const [saving, setSaving] = useState(false);

  function addCourse() {
    if (!newCourse.trim()) return;
    setForm({ ...form, coursework: [...(form.coursework || []), newCourse.trim()] });
    setNewCourse('');
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: '1rem' }}>
      <div className="row">
        <div className="field">
          <label>Institution</label>
          <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} required />
        </div>
        <div className="field">
          <label>Period</label>
          <input value={form.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="2020 – 2024" />
        </div>
      </div>
      <div className="field">
        <label>Degree</label>
        <input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} />
      </div>
      <div className="field">
        <label>Coursework</label>
        <div style={{ marginBottom: '.5rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
          {(form.coursework || []).map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '.2rem .5rem .2rem .7rem', fontSize: 12 }}>
              {c}
              <button type="button" onClick={() => setForm({ ...form, coursework: form.coursework.filter((_, idx) => idx !== i) })} style={{ background: 'none', padding: '0 .15rem', color: 'var(--muted)', fontSize: 14 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <input value={newCourse} onChange={e => setNewCourse(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCourse())} placeholder="Add course…" />
          <button type="button" className="btn-ghost" onClick={addCourse} style={{ flexShrink: 0 }}>Add</button>
        </div>
      </div>
      <div className="field" style={{ maxWidth: 120 }}>
        <label>Display Order</label>
        <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} />
      </div>
      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? <span className="spinner" /> : 'Save'}
        </button>
        {onCancel && <button className="btn-ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default function EducationPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding]   = useState(false);
  const [toast, showToast, closeToast] = useToast();

  const reload = useCallback(() => {
    setLoading(true);
    api.getEducation()
      .then(res => setItems(res.data || []))
      .catch(err => showToast(err.message, 'err'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  async function handleCreate(form) {
    try {
      await api.createEducation(form);
      showToast('Added');
      setAdding(false);
      reload();
    } catch (err) { showToast(err.message, 'err'); }
  }

  async function handleUpdate(id, form) {
    try {
      await api.updateEducation(id, form);
      showToast('Saved');
      setEditing(null);
      reload();
    } catch (err) { showToast(err.message, 'err'); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry?')) return;
    try {
      await api.deleteEducation(id);
      showToast('Deleted');
      reload();
    } catch (err) { showToast(err.message, 'err'); }
  }

  return (
    <div>
      <div className="section-header">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Education</h1>
        <button className="btn-primary" onClick={() => { setAdding(true); setEditing(null); }}>+ Add</button>
      </div>

      {adding && <EducationForm onSave={handleCreate} onCancel={() => setAdding(false)} />}

      {loading ? <div style={{ color: 'var(--muted)' }}>Loading…</div> : items.map(item =>
        editing === item.id ? (
          <EducationForm key={item.id} initial={item} onSave={f => handleUpdate(item.id, f)} onCancel={() => setEditing(null)} />
        ) : (
          <div key={item.id} className="list-item">
            <div className="info">
              <strong>{item.institution}</strong>
              <span>{item.degree} · {item.period}</span>
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
