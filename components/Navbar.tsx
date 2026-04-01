import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const NAV_BASE: { to: string; label: string }[] = [
  { to: '/',     label: '首頁' },
  { to: '/cars', label: '車款' },
];

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { user, login, register, logout } = useAuth();
  const T = theme;

  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = () => setShowUserMenu(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showUserMenu]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
      setShowModal(false);
      setForm({ email: '', password: '', name: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <nav style={{
        position:        'fixed',
        top:             0,
        left:            0,
        right:           0,
        zIndex:          100,
        backgroundColor: T.navBg,
        backdropFilter:  'blur(12px)',
        borderBottom:    `1px solid ${T.border}`,
        height:          56,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        padding:         isMobile ? '0 12px' : '0 32px',
      }}>
        {/* Left: Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 24 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: T.gold, letterSpacing: '-0.5px' }}>新車誌</span>
            {!isMobile && <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, letterSpacing: '0.15em' }}>AUTOMAG</span>}
          </Link>

          <div style={{ display: 'flex', gap: 2 }}>
            {[...NAV_BASE, ...(user?.role === 'admin' ? [{ to: '/admin', label: '後台' }] : [])].map(n => {
              const active = n.to === '/' ? pathname === '/' : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  style={{
                    padding:         isMobile ? '5px 8px' : '5px 12px',
                    borderRadius:    6,
                    fontSize:        isMobile ? 13 : 14,
                    fontWeight:      active ? 600 : 400,
                    color:           active ? T.gold : T.muted,
                    textDecoration:  'none',
                    backgroundColor: active ? (T.mode === 'dark' ? 'rgba(232,197,71,0.1)' : 'rgba(184,146,10,0.08)') : 'transparent',
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Theme toggle + Auth + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={T.mode === 'dark' ? '切換亮色主題' : '切換暗色主題'}
            style={{
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              width:           isMobile ? 32 : 36,
              height:          isMobile ? 32 : 36,
              borderRadius:    8,
              border:          `1px solid ${T.border}`,
              backgroundColor: T.card,
              color:           T.muted,
              cursor:          'pointer',
              flexShrink:      0,
              transition:      'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = T.gold;
              (e.currentTarget as HTMLButtonElement).style.color       = T.gold;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = T.border;
              (e.currentTarget as HTMLButtonElement).style.color       = T.muted;
            }}
          >
            {T.mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Auth button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={e => { e.stopPropagation(); setShowUserMenu(v => !v); }}
                style={{
                  display:         'flex',
                  alignItems:      'center',
                  gap:             6,
                  padding:         isMobile ? '5px 8px' : '6px 12px',
                  borderRadius:    8,
                  border:          `1px solid ${T.border}`,
                  backgroundColor: T.card,
                  color:           T.sub,
                  cursor:          'pointer',
                  fontSize:        13,
                  fontWeight:      500,
                }}
              >
                <UserIcon />
                {!isMobile && <span>{user.name}</span>}
              </button>
              {showUserMenu && (
                <div style={{
                  position:        'absolute',
                  top:             '100%',
                  right:           0,
                  marginTop:       6,
                  backgroundColor: T.card,
                  border:          `1px solid ${T.border}`,
                  borderRadius:    8,
                  padding:         4,
                  minWidth:        140,
                  boxShadow:       '0 8px 24px rgba(0,0,0,0.2)',
                  zIndex:          200,
                }}>
                  <div style={{ padding: '8px 12px', fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}` }}>
                    {user.email}
                  </div>
                  <button
                    onClick={logout}
                    style={{
                      display:         'block',
                      width:           '100%',
                      padding:         '8px 12px',
                      background:      'none',
                      border:          'none',
                      color:           '#e74c3c',
                      fontSize:        13,
                      cursor:          'pointer',
                      textAlign:       'left',
                      borderRadius:    4,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = T.rowAlt)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setShowModal(true); setIsRegister(false); setError(''); }}
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             5,
                padding:         isMobile ? '5px 8px' : '6px 12px',
                borderRadius:    8,
                border:          `1px solid ${T.border}`,
                backgroundColor: T.card,
                color:           T.sub,
                cursor:          'pointer',
                fontSize:        13,
                fontWeight:      500,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = T.gold;
                (e.currentTarget as HTMLButtonElement).style.color       = T.gold;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = T.border;
                (e.currentTarget as HTMLButtonElement).style.color       = T.sub;
              }}
            >
              <UserIcon />
              {!isMobile && <span>登入</span>}
            </button>
          )}

          {/* CTA */}
          <Link
            to="/cars"
            style={{
              padding:         isMobile ? '6px 12px' : '7px 18px',
              borderRadius:    6,
              fontSize:        isMobile ? 12 : 13,
              fontWeight:      600,
              color:           T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF',
              backgroundColor: T.gold,
              textDecoration:  'none',
              whiteSpace:      'nowrap',
            }}
          >
            {isMobile ? '探索' : '探索車款'}
          </Link>
        </div>
      </nav>

      {/* Login/Register Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position:        'fixed',
            inset:           0,
            zIndex:          300,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            backdropFilter:  'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: T.card,
              border:          `1px solid ${T.border}`,
              borderRadius:    14,
              padding:         32,
              width:           '100%',
              maxWidth:        380,
              margin:          16,
              boxShadow:       '0 16px 48px rgba(0,0,0,0.3)',
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: T.text }}>
              {isRegister ? '建立帳號' : '登入'}
            </h2>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 24px' }}>
              {isRegister ? '註冊新車誌帳號' : '歡迎回到新車誌'}
            </p>

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: T.muted, marginBottom: 6 }}>名稱</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      width:           '100%',
                      padding:         '10px 12px',
                      borderRadius:    8,
                      border:          `1px solid ${T.border}`,
                      backgroundColor: T.inputBg,
                      color:           T.text,
                      fontSize:        14,
                      outline:         'none',
                      boxSizing:       'border-box',
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: T.muted, marginBottom: 6 }}>電子郵件</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{
                    width:           '100%',
                    padding:         '10px 12px',
                    borderRadius:    8,
                    border:          `1px solid ${T.border}`,
                    backgroundColor: T.inputBg,
                    color:           T.text,
                    fontSize:        14,
                    outline:         'none',
                    boxSizing:       'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, color: T.muted, marginBottom: 6 }}>密碼</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{
                    width:           '100%',
                    padding:         '10px 12px',
                    borderRadius:    8,
                    border:          `1px solid ${T.border}`,
                    backgroundColor: T.inputBg,
                    color:           T.text,
                    fontSize:        14,
                    outline:         'none',
                    boxSizing:       'border-box',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#e74c3c', margin: '0 0 14px' }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width:           '100%',
                  padding:         '11px 0',
                  borderRadius:    8,
                  border:          'none',
                  backgroundColor: T.gold,
                  color:           T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF',
                  fontSize:        14,
                  fontWeight:      700,
                  cursor:          submitting ? 'not-allowed' : 'pointer',
                  opacity:         submitting ? 0.6 : 1,
                }}
              >
                {submitting ? '處理中...' : isRegister ? '註冊' : '登入'}
              </button>
            </form>

            <p style={{ fontSize: 13, color: T.muted, margin: '18px 0 0', textAlign: 'center' }}>
              {isRegister ? '已有帳號？' : '還沒有帳號？'}
              <button
                onClick={() => { setIsRegister(v => !v); setError(''); }}
                style={{ background: 'none', border: 'none', color: T.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                {isRegister ? '登入' : '建立帳號'}
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
