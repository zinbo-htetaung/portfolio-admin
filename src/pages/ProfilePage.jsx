import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import Toast from '../components/Toast';

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'ok') => setToast({ msg, type }), []);
  return [toast, show, () => setToast(null)];
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: '1.1rem', color: 'var(--accent)' }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [hero, setHero]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState('');
  const [toast, showToast, closeToast] = useToast();

  useEffect(() => {
    Promise.all([api.getProfile(), api.getHero()])
      .then(([p, h]) => {
        setProfile(p.data);
        setHero(h.data);
      })
      .catch(err => showToast(err.message, 'err'))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving('profile');
    try {
      await api.updateProfile(profile);
      showToast('Profile saved');
    } catch (err) { showToast(err.message, 'err'); }
    finally { setSaving(''); }
  }

  async function saveHero(e) {
    e.preventDefault();
    setSaving('hero');
    try {
      await api.updateHero(hero);
      showToast('Hero saved');
    } catch (err) { showToast(err.message, 'err'); }
    finally { setSaving(''); }
  }

  if (loading) return <div style={{ color: 'var(--muted)' }}>Loading…</div>;

  return (
    <div>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Profile &amp; Hero</h1>

      <Section title="Profile">
        <form onSubmit={saveProfile}>
          <div className="row">
            <div className="field">
              <label>Name</label>
              <input value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Location</label>
              <input value={profile.location || ''} onChange={e => setProfile({ ...profile, location: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Tagline</label>
            <input value={profile.tagline || ''} onChange={e => setProfile({ ...profile, tagline: e.target.value })} />
          </div>
          <div className="row">
            <div className="field">
              <label>Email</label>
              <input value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={profile.phoneNumber || ''} onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>GitHub URL</label>
              <input value={profile.githubUrl || ''} onChange={e => setProfile({ ...profile, githubUrl: e.target.value })} />
            </div>
            <div className="field">
              <label>LinkedIn URL</label>
              <input value={profile.linkedinUrl || ''} onChange={e => setProfile({ ...profile, linkedinUrl: e.target.value })} />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Portfolio URL</label>
              <input value={profile.portfolioUrl || ''} onChange={e => setProfile({ ...profile, portfolioUrl: e.target.value })} />
            </div>
            <div className="field">
              <label>Resume URL</label>
              <input value={profile.resumeUrl || ''} onChange={e => setProfile({ ...profile, resumeUrl: e.target.value })} />
            </div>
          </div>
          <button className="btn-primary" type="submit" disabled={saving === 'profile'}>
            {saving === 'profile' ? <span className="spinner" /> : 'Save Profile'}
          </button>
        </form>
      </Section>

      <Section title="Hero">
        <form onSubmit={saveHero}>
          <div className="field">
            <label>Subhead</label>
            <input value={hero.subhead || ''} onChange={e => setHero({ ...hero, subhead: e.target.value })} />
          </div>
          <div className="field">
            <label>Bio</label>
            <textarea rows={4} value={hero.bio || ''} onChange={e => setHero({ ...hero, bio: e.target.value })} />
          </div>
          <div className="field">
            <label>Photo URL</label>
            <input value={hero.photo || ''} onChange={e => setHero({ ...hero, photo: e.target.value })} />
          </div>
          <button className="btn-primary" type="submit" disabled={saving === 'hero'}>
            {saving === 'hero' ? <span className="spinner" /> : 'Save Hero'}
          </button>
        </form>
      </Section>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={closeToast} />}
    </div>
  );
}
