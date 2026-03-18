import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const NAV: { to: string; label: string }[] = [
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

const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const T = theme;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
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
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: T.gold, letterSpacing: '-0.5px' }}>新車誌</span>
          {!isMobile && <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, letterSpacing: '0.15em' }}>AUTOMAG</span>}
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 2 }}>
          {NAV.map(n => {
            const active = n.to === '/'
              ? pathname === '/'
              : pathname.startsWith(n.to);
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

      {/* Right: Theme toggle + CTA */}
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
  );
};

export default Navbar;
