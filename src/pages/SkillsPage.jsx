import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast';

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => setToast({ msg, type }), []);
  return [toast, show, () => setToast(null)];
}

// ── Skill Pills ────────────────────────────────────────────────────────────────

const PILL_EMPTY = { name: '', icon: '', summary: '', displayOrder: 0 };

function PillForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || PILL_EMPTY);
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
          <label>Skill Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="field">
          <label>Icon (emoji or text)</label>
          <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="⚛️" />
        </div>
      </div>
      <div className="field">
        <label>Summary (tooltip text)</label>
        <textarea rows={2} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
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

// ── Skill Languages ────────────────────────────────────────────────────────────

const LANG_EMPTY = { lang: '', level: '', displayOrder: 0 };

function LangForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || LANG_EMPTY);
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
          <label>Language</label>
          <input value={form.lang} onChange={e => setForm({ ...form, lang: e.target.value })} required placeholder="JavaScript" />
        </div>
        <div className="field">
          <label>Proficiency Level</label>
          <input value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} placeholder="e.g. Native, Full Professional, Limited Working" />
        </div>
        <div className="field" style={{ maxWidth: 120 }}>
          <label>Display Order</label>
          <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '.5rem' }}>
        <button className="btn-primary" type="submit" disabled={saving}>{saving ? <span className="spinner" /> : 'Save'}</button>
        {onCancel && <button className="btn-ghost" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const [pills, setPills]         = useState([]);
  const [langs, setLangs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editPill, setEditPill]   = useState(null);
  const [addingPill, setAddingPill] = useState(false);
  const [editLang, setEditLang]   = useState(null);
  const [addingLang, setAddingLang] = useState(false);
  const [toast, showToast, closeToast] = useToast();

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([api.getSkillPills(), api.getSkillLanguages()])
      .then(([p, l]) => { setPills(p.data || []); setLangs(l.data || []); })
      .catch(err => showToast(err.message, 'err'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  // Pills CRUD
  async function createPill(form) {
    try { await api.createSkillPill(form); showToast('Added'); setAddingPill(false); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }
  async function updatePill(id, form) {
    try { await api.updateSkillPill(id, form); showToast('Saved'); setEditPill(null); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }
  async function deletePill(id) {
    if (!confirm('Delete skill?')) return;
    try { await api.deleteSkillPill(id); showToast('Deleted'); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  // Languages CRUD
  async function createLang(form) {
    try { await api.createSkillLanguage(form); showToast('Added'); setAddingLang(false); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }
  async function updateLang(id, form) {
    try { await api.updateSkillLanguage(id, form); showToast('Saved'); setEditLang(null); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }
  async function deleteLang(id) {
    if (!confirm('Delete language?')) return;
    try { await api.deleteSkillLanguage(id); showToast('Deleted'); reload(); }
    catch (err) { showToast(err.message, 'err'); }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Skills</h1>

      {/* Skill Pills */}
      <div className="section-header">
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Skill Pills (Universe)</h2>
        <button className="btn-primary" onClick={() => { setAddingPill(true); setEditPill(null); }}>+ Add</button>
      </div>

      {addingPill && <PillForm onSave={createPill} onCancel={() => setAddingPill(false)} />}

      {loading ? <div style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Loading…</div> : pills.map(pill =>
        editPill === pill.id ? (
          <PillForm key={pill.id} initial={pill} onSave={f => updatePill(pill.id, f)} onCancel={() => setEditPill(null)} />
        ) : (
          <div key={pill.id} className="list-item">
            <div className="info">
              <strong>{pill.icon} {pill.name}</strong>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{pill.summary}</span>
            </div>
            <div className="actions">
              <button className="btn-ghost" onClick={() => { setEditPill(pill.id); setAddingPill(false); }}>Edit</button>
              <button className="btn-danger" onClick={() => deletePill(pill.id)}>Delete</button>
            </div>
          </div>
        )
      )}

      <hr className="divider" />

      {/* Languages */}
      <div className="section-header">
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Languages</h2>
        <button className="btn-primary" onClick={() => { setAddingLang(true); setEditLang(null); }}>+ Add</button>
      </div>

      {addingLang && <LangForm onSave={createLang} onCancel={() => setAddingLang(false)} />}

      {loading ? <div style={{ color: 'var(--muted)' }}>Loading…</div> : langs.map(lang =>
        editLang === lang.id ? (
          <LangForm key={lang.id} initial={lang} onSave={f => updateLang(lang.id, f)} onCancel={() => setEditLang(null)} />
        ) : (
          <div key={lang.id} className="list-item">
            <div className="info">
              <strong>{lang.lang}</strong>
              <span>Level: {lang.level}%</span>
            </div>
            <div className="actions">
              <button className="btn-ghost" onClick={() => { setEditLang(lang.id); setAddingLang(false); }}>Edit</button>
              <button className="btn-danger" onClick={() => deleteLang(lang.id)}>Delete</button>
            </div>
          </div>
        )
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />}
    </div>
  );
}
