import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { FECar, SiteStats, mpgToKmL, mpgToL100, milesToKm, co2ToGkm } from './types';
import { fetchCars, fetchCarById, fetchStats } from './services/carService';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import CarCard from './components/CarCard';
import CarListPage from './pages/CarListPage';
import AdminPage from './pages/AdminPage';

// ─── Brands list ──────────────────────────────────────────────────────────────
const BRANDS = [
  { make: 'Toyota',        zh: '豐田' },
  { make: 'Honda',         zh: '本田' },
  { make: 'BMW',           zh: '寶馬' },
  { make: 'Mercedes-Benz', zh: '賓士' },
  { make: 'Tesla',         zh: '特斯拉' },
  { make: 'Ford',          zh: '福特' },
  { make: 'Porsche',       zh: '保時捷' },
  { make: 'Audi',          zh: '奧迪' },
  { make: 'Hyundai',       zh: '現代' },
  { make: 'Kia',           zh: '起亞' },
  { make: 'Mazda',         zh: '馬自達' },
  { make: 'Lexus',         zh: '凌志' },
  { make: 'Subaru',        zh: '速霸陸' },
  { make: 'Volkswagen',    zh: '福斯' },
  { make: 'Nissan',        zh: '日產' },
];

// ─── HomePage ─────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  const navigate                   = useNavigate();
  const { theme: T }               = useTheme();
  const [search, setSearch]        = useState('');
  const [featured, setFeatured]    = useState<FECar[]>([]);
  const [evCars, setEvCars]        = useState<FECar[]>([]);
  const [stats, setStats]          = useState<SiteStats | null>(null);
  const [loadingFeat, setLoadFeat] = useState(true);

  useEffect(() => {
    fetchStats().then(setStats);
    fetchCars({ sort: 'year_desc', limit: 6 })
      .then(r => setFeatured(r.cars.slice(0, 6)))
      .finally(() => setLoadFeat(false));
    fetchCars({ fuel_type: 'electricity', sort: 'year_desc', limit: 4 })
      .then(r => setEvCars(r.cars.slice(0, 4)));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/cars?search=${encodeURIComponent(search.trim())}`);
    else navigate('/cars');
  };

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', color: T.text }}>
      {/* Hero */}
      <section style={{
        minHeight:      '90vh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '80px 32px 60px',
        background:     T.mode === 'dark'
          ? `radial-gradient(ellipse 80% 60% at 50% 10%, rgba(232,197,71,0.08) 0%, transparent 70%), ${T.bg}`
          : `radial-gradient(ellipse 80% 60% at 50% 10%, rgba(184,146,10,0.06) 0%, transparent 70%), ${T.bg}`,
        borderBottom:   `1px solid ${T.border}`,
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: T.gold, textTransform: 'uppercase', marginBottom: 20 }}>
          新車誌 · AutoMag
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 20px', maxWidth: 900, color: T.text }}>
          探索每一款<span style={{ color: T.gold }}>新車</span>的靈魂
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: T.muted, maxWidth: 600, lineHeight: 1.7, marginBottom: 48 }}>
          收錄來自美國能源部官方資料庫的完整油耗與規格數據，
          讓你以最客觀的數字認識每一部車。
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 520, marginBottom: 48 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜尋廠牌或型號... (Toyota, Camry, 特斯拉...)"
            style={{
              flex:            1,
              padding:         '14px 18px',
              borderRadius:    10,
              border:          `1px solid ${T.border}`,
              backgroundColor: T.inputBg,
              color:           T.text,
              fontSize:        15,
              outline:         'none',
            }}
          />
          <button type="submit" style={{
            padding:         '14px 24px',
            borderRadius:    10,
            border:          'none',
            backgroundColor: T.gold,
            color:           T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF',
            fontSize:        15,
            fontWeight:      700,
            cursor:          'pointer',
          }}>搜尋</button>
        </form>

        {/* Quick links */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: '電動車款', to: '/cars?fuel_type=electricity' },
            { label: '日系品牌', to: '/cars?make=Toyota' },
            { label: '德系豪華', to: '/cars?make=BMW' },
            { label: '最新車款', to: '/cars?sort=year_desc' },
          ].map(q => (
            <Link key={q.label} to={q.to} style={{
              padding:         '7px 16px',
              borderRadius:    20,
              border:          `1px solid ${T.border}`,
              color:           T.muted,
              fontSize:        13,
              textDecoration:  'none',
              backgroundColor: 'transparent',
            }}>{q.label}</Link>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      {stats && (
        <section style={{ borderBottom: `1px solid ${T.border}`, padding: '28px 32px', backgroundColor: T.bgSecondary }}>
          <div style={{
            maxWidth:            1280,
            margin:              '0 auto',
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap:                 24,
            textAlign:           'center',
          }}>
            {[
              { val: stats.total.toLocaleString(), label: '車款總數' },
              { val: stats.makes.toString(),       label: '收錄品牌' },
              { val: stats.evCount.toString(),     label: '電動車款' },
              { val: `${stats.avgMpg} mpg`,        label: '平均油耗' },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontSize: 30, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{s.val}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: 0, letterSpacing: '0.05em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured cars */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 6px' }}>最新收錄</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: T.text }}>精選新車</h2>
          </div>
          <Link to="/cars" style={{ fontSize: 13, color: T.gold, textDecoration: 'none', fontWeight: 600 }}>查看全部 →</Link>
        </div>
        {loadingFeat ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/9', backgroundColor: T.mode === 'dark' ? '#222' : '#EEEDE7' }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 10, backgroundColor: T.mode === 'dark' ? '#222' : '#EEEDE7', borderRadius: 4, width: '40%', marginBottom: 8 }} />
                  <div style={{ height: 14, backgroundColor: T.mode === 'dark' ? '#222' : '#EEEDE7', borderRadius: 4, width: '65%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {featured.map(car => (
              <CarCard key={car.id} car={car} onClick={() => navigate(`/car/${car.id}`)} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: T.muted }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🚗</p>
            <p style={{ fontSize: 16, marginBottom: 8 }}>資料庫尚無車款資料</p>
            <p style={{ fontSize: 13, marginBottom: 20 }}>請至車款頁面點擊「抓取車款資料」</p>
            <Link to="/cars" style={{
              padding:         '10px 24px',
              borderRadius:    8,
              backgroundColor: T.gold,
              color:           T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF',
              fontSize:        14,
              fontWeight:      700,
              textDecoration:  'none',
            }}>前往車款頁面</Link>
          </div>
        )}
      </section>

      {/* Brand grid */}
      <section style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgSecondary }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 6px' }}>依廠牌瀏覽</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: T.text }}>收錄品牌</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {BRANDS.map(b => (
              <Link
                key={b.make}
                to={`/cars?make=${encodeURIComponent(b.make)}`}
                style={{
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            6,
                  padding:        '18px 12px',
                  borderRadius:   10,
                  border:         `1px solid ${T.border}`,
                  backgroundColor: T.card,
                  textDecoration: 'none',
                  textAlign:      'center',
                  transition:     'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{b.zh}</span>
                <span style={{ fontSize: 11, color: T.muted }}>{b.make}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EV section */}
      {evCars.length > 0 && (
        <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 6px' }}>零排放</p>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0, color: T.text }}>電動車款</h2>
            </div>
            <Link to="/cars?fuel_type=electricity" style={{ fontSize: 13, color: T.gold, textDecoration: 'none', fontWeight: 600 }}>查看全部電動車 →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {evCars.map(car => (
              <CarCard key={car.id} car={car} onClick={() => navigate(`/car/${car.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '32px', textAlign: 'center', color: T.muted, fontSize: 12, backgroundColor: T.bgSecondary }}>
        <p style={{ margin: '0 0 6px', fontWeight: 600, color: T.sub }}>新車誌 AutoMag</p>
        <p style={{ margin: 0 }}>
          油耗數據來源：
          <a href="https://www.fueleconomy.gov" target="_blank" rel="noopener noreferrer" style={{ color: T.gold, textDecoration: 'none' }}>
            FuelEconomy.gov
          </a>
          ｜美國能源部官方資料庫
        </p>
        <p style={{ margin: '6px 0 0', color: T.mode === 'dark' ? '#444' : '#AAA', fontSize: 11 }}>車輛影像由 IMAGIN.studio 提供</p>
      </footer>
    </div>
  );
};

// ─── CarDetailPage ────────────────────────────────────────────────────────────
const CarDetailPage: React.FC = () => {
  const { id }                    = useParams<{ id: string }>();
  const navigate                  = useNavigate();
  const { theme: T }              = useTheme();
  const [car, setCar]             = useState<FECar | null>(null);
  const [similar, setSimilar]     = useState<FECar[]>([]);
  const [loading, setLoading]     = useState(true);
  const [imgFailed, setImgFailed] = useState(false);
  const [activeAngle, setAngle]   = useState<'banner' | 'detail' | 'main'>('banner');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setImgFailed(false);
    setAngle('banner');
    fetchCarById(Number(id)).then(c => {
      setCar(c);
      fetchCars({ make: c.make, sort: 'year_desc', limit: 5 }).then(r =>
        setSimilar(r.cars.filter(x => x.id !== c.id).slice(0, 4))
      );
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (loading) return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', paddingTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
      載入中...
    </div>
  );
  if (!car) return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', paddingTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: T.muted }}>
        <p style={{ fontSize: 40 }}>404</p>
        <p>找不到該車款</p>
        <button onClick={() => navigate('/cars')} style={{ marginTop: 12, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>← 返回車款列表</button>
      </div>
    </div>
  );

  const isEV   = car.fuelType?.toLowerCase().includes('electric');
  const imgSrc = activeAngle === 'banner' ? car.imageUrlBanner : activeAngle === 'detail' ? car.imageUrlDetail : car.imageUrl;

  const specRows: { label: string; value: string | number | null | undefined }[] = [
    { label: '廠牌',     value: car.makeZh ? `${car.makeZh} ${car.make}` : car.make },
    { label: '型號',     value: car.model },
    { label: '年份',     value: `${car.year} 年` },
    { label: '車型分類', value: car.vehicleClassZh || car.vehicleClass },
    { label: '燃料類型', value: car.fuelTypeZh },
    { label: '驅動方式', value: car.driveZh },
    { label: '變速箱',   value: car.transmissionZh },
    { label: '氣缸數',   value: car.cylinders ? `${car.cylinders} 缸` : null },
    { label: '排氣量',   value: car.displacement ? `${car.displacement} L` : null },
    { label: '市區油耗', value: car.cityMpg    ? `${mpgToKmL(car.cityMpg)} km/L（${car.cityMpg} mpg）` : null },
    { label: '高速油耗', value: car.highwayMpg ? `${mpgToKmL(car.highwayMpg)} km/L（${car.highwayMpg} mpg）` : null },
    { label: '綜合油耗', value: car.combinedMpg ? `${mpgToKmL(car.combinedMpg)} km/L（${mpgToL100(car.combinedMpg)} L/100km）` : null },
    { label: '市區電耗', value: car.cityMpgE    ? `${car.cityMpgE} MPGe` : null },
    { label: '高速電耗', value: car.highwayMpgE ? `${car.highwayMpgE} MPGe` : null },
    { label: '市區續航', value: car.rangeCity    ? `${milesToKm(car.rangeCity)} km（${car.rangeCity} miles）` : null },
    { label: '高速續航', value: car.rangeHighway ? `${milesToKm(car.rangeHighway)} km（${car.rangeHighway} miles）` : null },
    { label: 'CO₂排放',  value: car.co2          ? `${co2ToGkm(car.co2)} g/km（${car.co2} g/mile）` : null },
    { label: '完整變速器',value: car.transmission },
  ];

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', paddingTop: 56, color: T.text }}>
      {/* Banner */}
      <div style={{ position: 'relative', maxHeight: 480, overflow: 'hidden', backgroundColor: T.mode === 'dark' ? '#111' : '#E8E7E0' }}>
        {!imgFailed ? (
          <img
            key={imgSrc}
            src={imgSrc}
            alt={`${car.makeZh || car.make} ${car.model} ${car.year}`}
            style={{ width: '100%', maxHeight: 480, objectFit: 'cover', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 80 }}>🚗</span>
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        }} />
        <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
          <p style={{ fontSize: 12, color: T.gold, fontWeight: 700, letterSpacing: '0.1em', margin: '0 0 6px' }}>
            {car.vehicleClassZh || car.vehicleClass}
          </p>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 40px)', fontWeight: 900, margin: 0, color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
            {car.makeZh ? `${car.makeZh} ${car.make}` : car.make} {car.model}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '6px 0 0' }}>{car.year} 年款</p>
        </div>
      </div>

      {/* Angle picker */}
      {!imgFailed && (
        <div style={{ display: 'flex', gap: 8, padding: '16px 32px', borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgSecondary }}>
          {(['banner', 'main', 'detail'] as const).map(a => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              style={{
                padding:         '6px 14px',
                borderRadius:    6,
                border:          `1px solid ${activeAngle === a ? T.gold : T.border}`,
                backgroundColor: activeAngle === a ? (T.mode === 'dark' ? 'rgba(232,197,71,0.1)' : 'rgba(184,146,10,0.08)') : 'transparent',
                color:           activeAngle === a ? T.gold : T.muted,
                fontSize:        12,
                fontWeight:      activeAngle === a ? 600 : 400,
                cursor:          'pointer',
              }}
            >
              {{ banner: '正面', main: '側面', detail: '斜前' }[a]}
            </button>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        {/* MPG highlight cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 48 }}>
          {isEV ? (
            <>
              {car.rangeCity && (
                <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: '0 0 8px', letterSpacing: '0.05em' }}>市區續航</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{milesToKm(car.rangeCity)}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>公里</p>
                </div>
              )}
              {car.rangeHighway && (
                <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: '0 0 8px', letterSpacing: '0.05em' }}>高速續航</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{milesToKm(car.rangeHighway)}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>公里</p>
                </div>
              )}
              {car.combinedMpgE && (
                <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: '0 0 8px', letterSpacing: '0.05em' }}>綜合電耗</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{car.combinedMpgE}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>MPGe</p>
                </div>
              )}
            </>
          ) : (
            <>
              {car.cityMpg && (
                <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: '0 0 8px', letterSpacing: '0.05em' }}>市區油耗</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{mpgToKmL(car.cityMpg)}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>km/L</p>
                </div>
              )}
              {car.highwayMpg && (
                <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: '0 0 8px', letterSpacing: '0.05em' }}>高速油耗</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{mpgToKmL(car.highwayMpg)}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>km/L</p>
                </div>
              )}
              {car.combinedMpg && (
                <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: '0 0 8px', letterSpacing: '0.05em' }}>綜合油耗</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{mpgToKmL(car.combinedMpg)}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>km/L</p>
                </div>
              )}
              {car.co2 && (
                <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: '0 0 8px', letterSpacing: '0.05em' }}>CO₂排放</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{co2ToGkm(car.co2)}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>g/km</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Spec table */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: T.text }}>完整規格</h2>
          <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {specRows.filter(r => r.value && r.value !== '—').map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display:         'flex',
                  padding:         '14px 20px',
                  borderBottom:    i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                  backgroundColor: i % 2 === 0 ? 'transparent' : T.rowAlt,
                }}
              >
                <span style={{ flex: '0 0 140px', fontSize: 13, color: T.muted, fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: 13, color: T.sub }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Similar cars */}
        {similar.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: T.text }}>
              更多 {car.makeZh ? `${car.makeZh} ${car.make}` : car.make} 車款
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {similar.map(c => (
                <CarCard key={c.id} car={c} onClick={() => navigate(`/car/${c.id}`)} />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/cars')}
          style={{ background: 'none', border: 'none', color: T.muted, fontSize: 13, cursor: 'pointer', padding: 0 }}
        >
          ← 返回車款列表
        </button>
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
const AppInner: React.FC = () => (
  <HashRouter>
    <Navbar />
    <Routes>
      <Route path="/"        element={<HomePage />} />
      <Route path="/cars"    element={<CarListPage />} />
      <Route path="/car/:id" element={<CarDetailPage />} />
      <Route path="/admin"   element={<AdminPage />} />
    </Routes>
  </HashRouter>
);

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
