import React, { useState } from 'react';
import { FECar, mpgToKmL } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CarCardProps {
  car:     FECar;
  onClick?: () => void;
}

const CarCard: React.FC<CarCardProps> = ({ car, onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const { theme: T } = useTheme();
  const isEV = car.fuelType?.toLowerCase().includes('electric');

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: T.card,
        border:          `1px solid ${T.border}`,
        borderRadius:    12,
        overflow:        'hidden',
        cursor:          'pointer',
        display:         'flex',
        flexDirection:   'column',
        transition:      'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform   = 'translateY(-3px)';
        el.style.borderColor = T.gold;
        el.style.boxShadow   = T.mode === 'dark'
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : '0 8px 24px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform   = 'translateY(0)';
        el.style.borderColor = T.border;
        el.style.boxShadow   = 'none';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: T.mode === 'dark' ? '#111' : '#F0EFE9' }}>
        {!imgFailed ? (
          <img
            src={car.imageUrl}
            alt={`${car.makeZh || car.make} ${car.model} ${car.year}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={{
            width:          '100%',
            height:         '100%',
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            8,
            background:     T.mode === 'dark'
              ? 'linear-gradient(135deg, #1A1A1A, #111)'
              : 'linear-gradient(135deg, #F0EFE9, #E8E7E0)',
          }}>
            <span style={{ fontSize: 40 }}>🚗</span>
            <span style={{ fontSize: 11, color: T.muted, textAlign: 'center', padding: '0 12px' }}>
              {car.makeZh || car.make} {car.model}
            </span>
          </div>
        )}

        {/* Year badge */}
        <span style={{
          position:        'absolute',
          top:             10,
          right:           10,
          backgroundColor: T.gold,
          color:           T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF',
          fontSize:        11,
          fontWeight:      700,
          padding:         '3px 8px',
          borderRadius:    4,
        }}>
          {car.year}
        </span>

        {/* Class badge */}
        {car.vehicleClassZh && car.vehicleClassZh !== '—' && (
          <span style={{
            position:        'absolute',
            top:             10,
            left:            10,
            backgroundColor: 'rgba(0,0,0,0.6)',
            color:           '#DDDDDD',
            fontSize:        10,
            fontWeight:      500,
            padding:         '3px 8px',
            borderRadius:    4,
            backdropFilter:  'blur(4px)',
          }}>
            {car.vehicleClassZh}
          </span>
        )}

        {/* EV badge */}
        {isEV && (
          <span style={{
            position:        'absolute',
            bottom:          10,
            left:            10,
            backgroundColor: '#16a34a',
            color:           '#fff',
            fontSize:        10,
            fontWeight:      700,
            padding:         '3px 8px',
            borderRadius:    4,
          }}>
            電動
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            {car.makeZh ? `${car.makeZh} ${car.make}` : car.make}
          </p>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: 0, lineHeight: 1.3 }}>
            {car.model}
          </h3>
        </div>

        {/* Specs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 10px' }}>
          {car.displacement && (
            <span style={{ fontSize: 12, color: T.muted }}>
              <span style={{ color: T.sub, fontWeight: 500 }}>{car.displacement}L</span>
            </span>
          )}
          {car.cylinders && (
            <span style={{ fontSize: 12, color: T.muted }}>
              <span style={{ color: T.sub, fontWeight: 500 }}>{car.cylinders}</span>缸
            </span>
          )}
          {car.driveZh && car.driveZh !== '—' && (
            <span style={{ fontSize: 12, color: T.sub, fontWeight: 500 }}>{car.driveZh}</span>
          )}
          {car.transmissionZh && car.transmissionZh !== '—' && (
            <span style={{ fontSize: 12, color: T.muted }}>{car.transmissionZh}</span>
          )}
          {car.fuelTypeZh && car.fuelTypeZh !== '—' && (
            <span style={{ fontSize: 12, color: T.muted }}>{car.fuelTypeZh}</span>
          )}
        </div>

        {/* MPG / Range */}
        {isEV ? (
          (car.rangeCity || car.rangeHighway) && (
            <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: `1px solid ${T.border}`, marginTop: 'auto' }}>
              {car.rangeCity && (
                <div>
                  <p style={{ fontSize: 10, color: T.muted, margin: '0 0 2px' }}>市區續航</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: T.gold, margin: 0 }}>
                    {Math.round(car.rangeCity * 1.60934)}
                    <span style={{ fontSize: 10, color: T.muted, fontWeight: 400 }}> km</span>
                  </p>
                </div>
              )}
              {car.rangeHighway && (
                <div>
                  <p style={{ fontSize: 10, color: T.muted, margin: '0 0 2px' }}>高速續航</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: T.gold, margin: 0 }}>
                    {Math.round(car.rangeHighway * 1.60934)}
                    <span style={{ fontSize: 10, color: T.muted, fontWeight: 400 }}> km</span>
                  </p>
                </div>
              )}
            </div>
          )
        ) : (
          (car.cityMpg || car.highwayMpg) && (
            <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: `1px solid ${T.border}`, marginTop: 'auto' }}>
              {car.cityMpg && (
                <div>
                  <p style={{ fontSize: 10, color: T.muted, margin: '0 0 2px' }}>市區</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                    {mpgToKmL(car.cityMpg)}
                    <span style={{ fontSize: 10, color: T.muted, fontWeight: 400 }}> km/L</span>
                  </p>
                </div>
              )}
              {car.cityMpg && car.highwayMpg && <div style={{ width: 1, backgroundColor: T.border }} />}
              {car.highwayMpg && (
                <div>
                  <p style={{ fontSize: 10, color: T.muted, margin: '0 0 2px' }}>高速</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                    {mpgToKmL(car.highwayMpg)}
                    <span style={{ fontSize: 10, color: T.muted, fontWeight: 400 }}> km/L</span>
                  </p>
                </div>
              )}
            </div>
          )
        )}

        <button
          style={{
            marginTop:       8,
            width:           '100%',
            padding:         '9px',
            border:          `1px solid ${T.border}`,
            borderRadius:    7,
            backgroundColor: 'transparent',
            color:           T.gold,
            fontSize:        13,
            fontWeight:      600,
            cursor:          'pointer',
          }}
          onClick={e => { e.stopPropagation(); onClick?.(); }}
        >
          查看規格 →
        </button>
      </div>
    </div>
  );
};

export default CarCard;
