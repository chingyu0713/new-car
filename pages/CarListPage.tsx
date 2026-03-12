import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CarCard from '../components/CarCard';
import { fetchCars, fetchMakes, fetchClasses, triggerSeed, fetchSeedStatus } from '../services/carService';
import { FECarsResponse, FECarFilters, MakeOption, ClassOption } from '../types';
import { useTheme } from '../contexts/ThemeContext';

const DRIVE_OPTS = [
  { val: '',                   label: '全部驅動' },
  { val: 'front-wheel drive',  label: '前輪驅動' },
  { val: 'rear-wheel drive',   label: '後輪驅動' },
  { val: 'all-wheel drive',    label: '全輪驅動' },
  { val: '4-wheel drive',      label: '四輪驅動' },
];
const FUEL_OPTS = [
  { val: '',                 label: '全部燃料' },
  { val: 'regular gasoline', label: '汽油' },
  { val: 'diesel',           label: '柴油' },
  { val: 'electricity',      label: '電動' },
];
const SORT_OPTS = [
  { val: 'year_desc', label: '最新年份' },
  { val: 'year_asc',  label: '最舊年份' },
  { val: 'make_asc',  label: '廠牌 A→Z' },
  { val: 'mpg_desc',  label: '油耗最佳' },
];
const YEARS = Array.from({ length: 5 }, (_, i) => 2024 - i);

interface Filters {
  make: string; classVal: string; year: string;
  fuel: string; drive: string; search: string; sort: string;
}
const DEF: Filters = { make: '', classVal: '', year: '', fuel: '', drive: '', search: '', sort: 'year_desc' };

const CarListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme: T } = useTheme();
  const [f, setF] = useState<Filters>({
    ...DEF,
    make:   searchParams.get('make')      ?? '',
    fuel:   searchParams.get('fuel_type') ?? '',
    search: searchParams.get('search')    ?? '',
  });
  const [data, setData]         = useState<FECarsResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);
  const [makes, setMakes]       = useState<MakeOption[]>([]);
  const [classes, setClasses]   = useState<ClassOption[]>([]);
  const [seeding, setSeeding]   = useState(false);
  const [seedMsg, setSeedMsg]   = useState('');

  const sel: React.CSSProperties = {
    backgroundColor: T.inputBg,
    border:          `1px solid ${T.border}`,
    borderRadius:    7,
    color:           T.sub,
    fontSize:        13,
    padding:         '8px 12px',
    cursor:          'pointer',
    outline:         'none',
  };

  useEffect(() => {
    fetchMakes().then(setMakes);
    fetchClasses().then(setClasses);
  }, []);

  const buildApiFilters = (fl: Filters): FECarFilters => {
    const r: FECarFilters = { sort: fl.sort as FECarFilters['sort'], limit: 21 };
    if (fl.make)     r.make      = fl.make;
    if (fl.classVal) r.class     = fl.classVal;
    if (fl.year)     r.year      = Number(fl.year);
    if (fl.fuel)     r.fuel_type = fl.fuel;
    if (fl.drive)    r.drive     = fl.drive;
    if (fl.search)   r.search    = fl.search;
    return r;
  };

  const load = useCallback(async (fl: Filters, pg: number) => {
    setLoading(true); setError(null);
    try {
      setData(await fetchCars(buildApiFilters(fl), pg));
    } catch {
      setError('無法連接後端伺服器，請確認後端已啟動 (port 5001)');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(f, page); }, [f, page, load]);

  const upd = (key: keyof Filters, val: string) => {
    setF(p => ({ ...p, [key]: val }));
    setPage(1);
  };
  const reset = () => { setF(DEF); setPage(1); };
  const hasFilter = f.make || f.classVal || f.year || f.fuel || f.drive || f.search;

  const handleSeed = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedMsg('正在啟動資料抓取...');
    const res = await triggerSeed();
    setSeedMsg(res.message ?? '已開始抓取');
    const poll = setInterval(async () => {
      const st = await fetchSeedStatus();
      setSeedMsg(`抓取進度 ${st.done}/${st.total} 筆...`);
      if (!st.seeding) {
        clearInterval(poll);
        setSeeding(false);
        setSeedMsg(`完成！共收錄 ${st.done} 筆車款`);
        load(f, page);
        setTimeout(() => setSeedMsg(''), 6000);
      }
    }, 2000);
  };

  const SkeletonCard = () => (
    <div style={{
      backgroundColor: T.card,
      border:          `1px solid ${T.border}`,
      borderRadius:    12,
      overflow:        'hidden',
    }}>
      <div style={{ aspectRatio: '16/9', backgroundColor: T.mode === 'dark' ? '#222' : '#EEEDE7' }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 10, backgroundColor: T.mode === 'dark' ? '#222' : '#EEEDE7', borderRadius: 4, width: '40%' }} />
        <div style={{ height: 14, backgroundColor: T.mode === 'dark' ? '#222' : '#EEEDE7', borderRadius: 4, width: '65%' }} />
        <div style={{ height: 10, backgroundColor: T.mode === 'dark' ? '#222' : '#EEEDE7', borderRadius: 4, width: '50%' }} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bg, paddingTop: 56, color: T.text }}>
      {/* Sticky filter bar */}
      <div style={{
        position:        'sticky',
        top:             56,
        zIndex:          50,
        backgroundColor: T.mode === 'dark' ? 'rgba(13,13,13,0.97)' : 'rgba(247,246,242,0.97)',
        backdropFilter:  'blur(12px)',
        borderBottom:    `1px solid ${T.border}`,
        padding:         '12px 32px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {/* Search */}
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.muted, fontSize: 14, pointerEvents: 'none' }}>⌕</span>
            <input
              type="text"
              value={f.search}
              onChange={e => upd('search', e.target.value)}
              placeholder="搜尋廠牌或型號..."
              style={{ ...sel, width: '100%', paddingLeft: 30, boxSizing: 'border-box' }}
            />
          </div>

          <select value={f.make} onChange={e => upd('make', e.target.value)} style={sel}>
            <option value="">全部廠牌</option>
            {makes.map(m => <option key={m.make} value={m.make}>{m.makeZh ? `${m.makeZh} ${m.make}` : m.make}</option>)}
          </select>

          <select value={f.year} onChange={e => upd('year', e.target.value)} style={sel}>
            <option value="">全部年份</option>
            {YEARS.map(y => <option key={y} value={y}>{y} 年</option>)}
          </select>

          <select value={f.fuel} onChange={e => upd('fuel', e.target.value)} style={sel}>
            {FUEL_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>

          <select value={f.drive} onChange={e => upd('drive', e.target.value)} style={sel}>
            {DRIVE_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>

          <select value={f.sort} onChange={e => upd('sort', e.target.value)} style={sel}>
            {SORT_OPTS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
          </select>

          {hasFilter && (
            <button onClick={reset} style={{
              backgroundColor: 'transparent',
              border:          `1px solid ${T.border}`,
              borderRadius:    7,
              color:           T.muted,
              fontSize:        12,
              padding:         '8px 12px',
              cursor:          'pointer',
            }}>清除篩選</button>
          )}
        </div>

        {/* Class pills */}
        {classes.length > 0 && (
          <div style={{ maxWidth: 1280, margin: '10px auto 0', display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            <button
              onClick={() => upd('classVal', '')}
              style={{
                flexShrink:      0,
                padding:         '4px 12px',
                borderRadius:    20,
                fontSize:        12,
                fontWeight:      500,
                cursor:          'pointer',
                border:          'none',
                backgroundColor: !f.classVal ? T.pillActive : T.pillBg,
                color:           !f.classVal ? (T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF') : T.pillText,
              }}
            >全部車型</button>
            {classes.map(c => (
              <button
                key={c.cls}
                onClick={() => upd('classVal', c.cls === f.classVal ? '' : c.cls)}
                style={{
                  flexShrink:      0,
                  padding:         '4px 12px',
                  borderRadius:    20,
                  fontSize:        12,
                  fontWeight:      500,
                  cursor:          'pointer',
                  border:          'none',
                  backgroundColor: f.classVal === c.cls ? T.pillActive : T.pillBg,
                  color:           f.classVal === c.cls ? (T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF') : T.pillText,
                }}
              >{c.clsZh || c.cls}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>
            {loading ? '載入中...' : data ? `共 ${data.total} 款車` : ''}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {seedMsg && <span style={{ fontSize: 12, color: T.gold }}>{seedMsg}</span>}
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                padding:         '7px 14px',
                borderRadius:    6,
                fontSize:        12,
                fontWeight:      600,
                cursor:          seeding ? 'not-allowed' : 'pointer',
                border:          `1px solid ${T.border}`,
                backgroundColor: 'transparent',
                color:           seeding ? T.muted : T.gold,
              }}
            >
              {seeding ? '抓取中...' : '抓取車款資料'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(220,38,38,0.08)',
            border:          '1px solid rgba(220,38,38,0.3)',
            borderRadius:    8,
            padding:         '12px 16px',
            color:           '#ef4444',
            fontSize:        13,
            marginBottom:    20,
          }}>⚠ {error}</div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data && data.cars.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {data.cars.map(car => (
                <CarCard key={car.id} car={car} onClick={() => navigate(`/car/${car.id}`)} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 40 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding:         '8px 16px',
                    borderRadius:    6,
                    border:          `1px solid ${T.border}`,
                    backgroundColor: 'transparent',
                    color:           page === 1 ? T.border : T.sub,
                    fontSize:        13,
                    cursor:          page === 1 ? 'not-allowed' : 'pointer',
                  }}
                >上一頁</button>

                {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
                  const pg = page <= 4 ? i + 1 : page - 3 + i;
                  if (pg < 1 || pg > data.totalPages) return null;
                  return (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      style={{
                        padding:         '8px 14px',
                        borderRadius:    6,
                        border:          `1px solid ${pg === page ? T.gold : T.border}`,
                        backgroundColor: pg === page ? T.gold : 'transparent',
                        color:           pg === page ? (T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF') : T.sub,
                        fontSize:        13,
                        fontWeight:      pg === page ? 700 : 400,
                        cursor:          'pointer',
                      }}
                    >{pg}</button>
                  );
                })}

                <button
                  disabled={page === data.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding:         '8px 16px',
                    borderRadius:    6,
                    border:          `1px solid ${T.border}`,
                    backgroundColor: 'transparent',
                    color:           page === data.totalPages ? T.border : T.sub,
                    fontSize:        13,
                    cursor:          page === data.totalPages ? 'not-allowed' : 'pointer',
                  }}
                >下一頁</button>
              </div>
            )}
          </>
        ) : !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
            <span style={{ fontSize: 56 }}>🚗</span>
            <p style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0 }}>找不到車款資料</p>
            <p style={{ fontSize: 14, color: T.muted, textAlign: 'center', maxWidth: 360, margin: 0 }}>
              {data?.total === 0 && !hasFilter
                ? '資料庫是空的，請點擊「抓取車款資料」從 FuelEconomy.gov 載入資料'
                : '試試看調整篩選條件'}
            </p>
            {!hasFilter && (
              <button onClick={handleSeed} disabled={seeding} style={{
                padding:         '10px 24px',
                borderRadius:    8,
                backgroundColor: T.gold,
                color:           T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF',
                fontSize:        14,
                fontWeight:      700,
                border:          'none',
                cursor:          seeding ? 'not-allowed' : 'pointer',
              }}>
                {seeding ? '抓取中...' : '立即從 FuelEconomy.gov 抓取'}
              </button>
            )}
            {hasFilter && (
              <button onClick={reset} style={{
                backgroundColor: 'transparent',
                border:          'none',
                color:           T.gold,
                fontSize:        14,
                fontWeight:      600,
                cursor:          'pointer',
              }}>清除所有篩選</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarListPage;
