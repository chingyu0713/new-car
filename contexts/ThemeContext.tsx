import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode:        ThemeMode;
  bg:          string;
  bgSecondary: string;
  card:        string;
  border:      string;
  gold:        string;
  text:        string;
  muted:       string;
  sub:         string;
  navBg:       string;
  inputBg:     string;
  pillBg:      string;
  pillActive:  string;
  pillText:    string;
  rowAlt:      string;
}

const DARK: Theme = {
  mode:        'dark',
  bg:          '#0D0D0D',
  bgSecondary: '#111111',
  card:        '#1A1A1A',
  border:      '#2A2A2A',
  gold:        '#E8C547',
  text:        '#FFFFFF',
  muted:       '#888888',
  sub:         '#CCCCCC',
  navBg:       'rgba(13,13,13,0.95)',
  inputBg:     '#1A1A1A',
  pillBg:      '#222222',
  pillActive:  '#E8C547',
  pillText:    '#888888',
  rowAlt:      'rgba(255,255,255,0.02)',
};

const LIGHT: Theme = {
  mode:        'light',
  bg:          '#F7F6F2',
  bgSecondary: '#EFEFEA',
  card:        '#FFFFFF',
  border:      '#E0DFD9',
  gold:        '#B8920A',
  text:        '#0D0D0D',
  muted:       '#777777',
  sub:         '#444444',
  navBg:       'rgba(247,246,242,0.97)',
  inputBg:     '#FFFFFF',
  pillBg:      '#EFEFEA',
  pillActive:  '#B8920A',
  pillText:    '#666666',
  rowAlt:      'rgba(0,0,0,0.02)',
};

interface ThemeCtx {
  theme:  Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: DARK, toggle: () => {} });

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('automag_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const theme = mode === 'dark' ? DARK : LIGHT;

  useEffect(() => {
    localStorage.setItem('automag_theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
    document.documentElement.style.backgroundColor = theme.bg;
    document.body.style.backgroundColor           = theme.bg;
    document.body.style.color                     = theme.text;
  }, [mode, theme]);

  const toggle = () => setMode(m => m === 'dark' ? 'light' : 'dark');

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
};

export const useTheme = () => useContext(Ctx);
