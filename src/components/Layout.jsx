import { useEffect, useRef } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const IDLE_MS  = 5 * 60 * 1000; // 5 minutes
const EVENTS   = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
const LAST_KEY = 'last_active';

function clearSession() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem(LAST_KEY);
}

export default function Layout() {
  const token    = localStorage.getItem('admin_token');
  const navigate = useNavigate();
  const timerRef = useRef(null);

  // Check on every page load: if tab was closed more than 5 min ago, force logout
  if (token) {
    const last = parseInt(localStorage.getItem(LAST_KEY) || '0', 10);
    if (last && Date.now() - last > IDLE_MS) {
      clearSession();
      // Will fall through to the !token redirect below
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) return;

    function logout() {
      clearSession();
      navigate('/login', { replace: true });
    }

    function reset() {
      localStorage.setItem(LAST_KEY, Date.now().toString());
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, IDLE_MS);
    }

    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // record activity immediately on mount

    return () => {
      clearTimeout(timerRef.current);
      EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [navigate]);

  if (!localStorage.getItem('admin_token')) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
