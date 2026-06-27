import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  { to: '/profile',    label: 'Profile & Hero' },
  { to: '/about',      label: 'About' },
  { to: '/education',  label: 'Education' },
  { to: '/experience', label: 'Experience' },
  { to: '/projects',   label: 'Projects' },
  { to: '/skills',     label: 'Skills' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('admin_token');
    navigate('/login');
  }

  return (
    <aside style={{
      width: 210, flexShrink: 0, background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '1.4rem 1.2rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.05em' }}>ADMIN</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>zinbohtetaung.com</div>
      </div>
      <nav style={{ flex: 1, padding: '.8rem .6rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'block',
              padding: '.55rem .8rem',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--text)',
              background: isActive ? 'rgba(124,106,247,.12)' : 'transparent',
              transition: 'background .15s, color .15s',
            })}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: '.8rem .6rem 1.2rem' }}>
        <button className="btn-ghost" style={{ width: '100%' }} onClick={logout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
