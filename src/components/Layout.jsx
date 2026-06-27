import { useEffect, useRef } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const IDLE_MS = 5 * 60 * 1000; // 5 minutes
const EVENTS  = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export default function Layout() {
  const token    = localStorage.getItem('admin_token');
  const navigate = useNavigate();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    function logout() {
      localStorage.removeItem('admin_token');
      navigate('/login', { replace: true });
    }

    function reset() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(logout, IDLE_MS);
    }

    EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      clearTimeout(timerRef.current);
      EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [token, navigate]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
