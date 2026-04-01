import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

import { API_BASE as BASE, API_HOST } from '../services/api';

interface AdminCar {
  id: number;
  fuel_economy_id: number;
  make: string;
  model: string;
  year: number;
  make_zh: string | null;
  vehicle_class: string | null;
  vehicle_class_zh: string | null;
  fuel_type: string | null;
  fuel_type_zh: string | null;
  drive: string | null;
  drive_zh: string | null;
  transmission: string | null;
  transmission_zh: string | null;
  cylinders: number | null;
  displacement: string | null;
  city_mpg: number | null;
  highway_mpg: number | null;
  combined_mpg: number | null;
  city_mpg_e: number | null;
  highway_mpg_e: number | null;
  combined_mpg_e: number | null;
  range_city: number | null;
  range_highway: number | null;
  co2: number | null;
  image_url: string | null;
  image_url_banner: string | null;
  image_url_detail: string | null;
  trim_desc: string | null;
}

interface DashStats {
  totalCars: number;
  totalUsers: number;
  totalMakes: number;
}

const EDITABLE_FIELDS: { key: keyof AdminCar; label: string; type: 'text' | 'number' }[] = [
  { key: 'make',              label: '廠牌 (EN)',    type: 'text' },
  { key: 'make_zh',           label: '廠牌 (中)',    type: 'text' },
  { key: 'model',             label: '型號',         type: 'text' },
  { key: 'year',              label: '年份',         type: 'number' },
  { key: 'trim_desc',         label: '變速器描述',   type: 'text' },
  { key: 'vehicle_class',     label: '車型 (EN)',    type: 'text' },
  { key: 'vehicle_class_zh',  label: '車型 (中)',    type: 'text' },
  { key: 'fuel_type',         label: '燃料 (EN)',    type: 'text' },
  { key: 'fuel_type_zh',      label: '燃料 (中)',    type: 'text' },
  { key: 'drive',             label: '驅動 (EN)',    type: 'text' },
  { key: 'drive_zh',          label: '驅動 (中)',    type: 'text' },
  { key: 'transmission',      label: '變速箱 (EN)',  type: 'text' },
  { key: 'transmission_zh',   label: '變速箱 (中)',  type: 'text' },
  { key: 'cylinders',         label: '氣缸數',       type: 'number' },
  { key: 'displacement',      label: '排氣量 (L)',   type: 'number' },
  { key: 'city_mpg',          label: '市區 MPG',     type: 'number' },
  { key: 'highway_mpg',       label: '高速 MPG',     type: 'number' },
  { key: 'combined_mpg',      label: '綜合 MPG',     type: 'number' },
  { key: 'city_mpg_e',        label: '市區 MPGe',    type: 'number' },
  { key: 'highway_mpg_e',     label: '高速 MPGe',    type: 'number' },
  { key: 'combined_mpg_e',    label: '綜合 MPGe',    type: 'number' },
  { key: 'range_city',        label: '市區續航 (mi)',type: 'number' },
  { key: 'range_highway',     label: '高速續航 (mi)',type: 'number' },
  { key: 'co2',               label: 'CO₂ (g/mi)',  type: 'number' },
];

interface CarImage {
  id: number;
  car_id: number;
  slot: string;
  url: string;
  sort_order: number;
}

const SLOTS = [
  { key: 'main',   label: '主圖 (側面)' },
  { key: 'banner', label: 'Banner (正面)' },
  { key: 'detail', label: '細節 (斜前)' },
] as const;


const AdminPage: React.FC = () => {
  const { theme: T } = useTheme();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashStats | null>(null);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminCar | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState<'cars' | 'users'>('cars');
  const [users, setUsers] = useState<any[]>([]);
  const [images, setImages] = useState<CarImage[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [editTab, setEditTab] = useState<'fields' | 'images'>('fields');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Redirect non-admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/admin/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch {}
  }, [token]);

  const fetchCars = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`${BASE}/admin/cars?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCars(data.cars);
        setTotal(data.total);
      }
    } catch {}
  }, [token, page, search]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/admin/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {}
  }, [token]);

  const fetchCarImages = useCallback(async (carId: number) => {
    try {
      const res = await fetch(`${BASE}/admin/cars/${carId}/images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setImages(data.images);
      }
    } catch {}
  }, [token]);

  const handleUpload = async (carId: number, slot: string, files: FileList) => {
    setUploading(slot);
    const formData = new FormData();
    formData.append('slot', slot);
    Array.from(files).forEach(f => formData.append('images', f));

    try {
      const res = await fetch(`${BASE}/admin/cars/${carId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        await fetchCarImages(carId);
      }
    } catch {}
    setUploading(null);
  };

  const handleDeleteImage = async (carId: number, imageId: number) => {
    try {
      const res = await fetch(`${BASE}/admin/cars/${carId}/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch {}
  };

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCars(); }, [fetchCars]);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab, fetchUsers]);

  const openEdit = (car: AdminCar) => {
    setEditing(car);
    const form: Record<string, any> = {};
    EDITABLE_FIELDS.forEach(f => { form[f.key] = car[f.key] ?? ''; });
    setEditForm(form);
    setMsg('');
    setEditTab('fields');
    fetchCarImages(car.id);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setMsg('');
    try {
      // Only send changed fields
      const changes: Record<string, any> = {};
      for (const f of EDITABLE_FIELDS) {
        const orig = editing[f.key] ?? '';
        const curr = editForm[f.key] ?? '';
        if (String(orig) !== String(curr)) {
          changes[f.key] = f.type === 'number' && curr !== '' ? Number(curr) : curr;
        }
      }
      if (Object.keys(changes).length === 0) {
        setMsg('沒有變更');
        setSaving(false);
        return;
      }

      const res = await fetch(`${BASE}/admin/cars/${editing.id}`, {
        method: 'PUT', headers, body: JSON.stringify(changes),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('✓ 更新成功');
        setCars(prev => prev.map(c => c.id === editing.id ? data.car : c));
        setEditing(data.car);
        // refresh form
        const form: Record<string, any> = {};
        EDITABLE_FIELDS.forEach(f => { form[f.key] = data.car[f.key] ?? ''; });
        setEditForm(form);
      } else {
        setMsg(data.error || '更新失敗');
      }
    } catch { setMsg('更新失敗'); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('確定要刪除這筆車款嗎？')) return;
    try {
      const res = await fetch(`${BASE}/admin/cars/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        setCars(prev => prev.filter(c => c.id !== id));
        setTotal(t => t - 1);
        if (editing?.id === id) setEditing(null);
        fetchStats();
      }
    } catch {}
  };

  if (!user || user.role !== 'admin') return null;

  const totalPages = Math.ceil(total / 20);

  const inputStyle = {
    width:           '100%',
    padding:         '8px 10px',
    borderRadius:    6,
    border:          `1px solid ${T.border}`,
    backgroundColor: T.inputBg,
    color:           T.text,
    fontSize:        13,
    outline:         'none',
    boxSizing:       'border-box' as const,
  };

  return (
    <div style={{ backgroundColor: T.bg, minHeight: '100vh', paddingTop: 56, color: T.text }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 6px' }}>管理後台</p>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>Admin Dashboard</h1>
        </div>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { val: stats.totalCars, label: '車款總數' },
              { val: stats.totalUsers, label: '使用者數' },
              { val: stats.totalMakes, label: '品牌數' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '20px 16px', textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: T.gold, margin: '0 0 4px' }}>{s.val}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {(['cars', 'users'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding:         '8px 20px',
                borderRadius:    6,
                border:          `1px solid ${tab === t ? T.gold : T.border}`,
                backgroundColor: tab === t ? (T.mode === 'dark' ? 'rgba(232,197,71,0.1)' : 'rgba(184,146,10,0.08)') : 'transparent',
                color:           tab === t ? T.gold : T.muted,
                fontSize:        13,
                fontWeight:      tab === t ? 600 : 400,
                cursor:          'pointer',
              }}
            >
              {{ cars: '車款管理', users: '使用者' }[t]}
            </button>
          ))}
        </div>

        {tab === 'cars' && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {/* Car list */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Search */}
              <div style={{ marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="搜尋廠牌或型號..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  style={{ ...inputStyle, maxWidth: 320 }}
                />
              </div>

              {/* Table */}
              <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgSecondary }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>ID</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>廠牌</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>型號</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>年份</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>油耗</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', color: T.muted, fontWeight: 600 }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car, i) => (
                      <tr
                        key={car.id}
                        style={{
                          borderBottom: `1px solid ${T.border}`,
                          backgroundColor: editing?.id === car.id ? (T.mode === 'dark' ? 'rgba(232,197,71,0.05)' : 'rgba(184,146,10,0.05)') : i % 2 === 0 ? 'transparent' : T.rowAlt,
                          cursor: 'pointer',
                        }}
                        onClick={() => openEdit(car)}
                      >
                        <td style={{ padding: '10px 12px', color: T.muted }}>{car.id}</td>
                        <td style={{ padding: '10px 12px' }}>{car.make_zh || car.make}</td>
                        <td style={{ padding: '10px 12px' }}>{car.model}</td>
                        <td style={{ padding: '10px 12px' }}>{car.year}</td>
                        <td style={{ padding: '10px 12px', color: T.muted }}>{car.combined_mpg ? `${car.combined_mpg} mpg` : '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(car.id); }}
                            style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: 12 }}
                          >
                            刪除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${T.border}`, backgroundColor: T.card, color: T.text, cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: 13, opacity: page <= 1 ? 0.4 : 1 }}
                  >上一頁</button>
                  <span style={{ padding: '6px 12px', fontSize: 13, color: T.muted }}>{page} / {totalPages}</span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${T.border}`, backgroundColor: T.card, color: T.text, cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontSize: 13, opacity: page >= totalPages ? 0.4 : 1 }}
                  >下一頁</button>
                </div>
              )}

              <p style={{ fontSize: 12, color: T.muted, marginTop: 12 }}>共 {total} 筆，點擊列可編輯</p>
            </div>

            {/* Edit panel */}
            {editing && (
              <div style={{
                width:           400,
                flexShrink:      0,
                position:        'sticky',
                top:             72,
                backgroundColor: T.card,
                border:          `1px solid ${T.border}`,
                borderRadius:    10,
                padding:         20,
                maxHeight:       'calc(100vh - 88px)',
                overflowY:       'auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                    編輯 #{editing.id} — {editing.make_zh || editing.make} {editing.model}
                  </h3>
                  <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18 }}>×</button>
                </div>

                {/* Edit sub-tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {(['fields', 'images'] as const).map(et => (
                    <button
                      key={et}
                      onClick={() => setEditTab(et)}
                      style={{
                        padding: '5px 14px', borderRadius: 5, fontSize: 12, fontWeight: editTab === et ? 600 : 400,
                        border: `1px solid ${editTab === et ? T.gold : T.border}`,
                        backgroundColor: editTab === et ? (T.mode === 'dark' ? 'rgba(232,197,71,0.1)' : 'rgba(184,146,10,0.08)') : 'transparent',
                        color: editTab === et ? T.gold : T.muted, cursor: 'pointer',
                      }}
                    >
                      {{ fields: '欄位', images: '圖片管理' }[et]}
                    </button>
                  ))}
                </div>

                {editTab === 'fields' && (
                  <>
                    {EDITABLE_FIELDS.map(f => (
                      <div key={f.key} style={{ marginBottom: 10 }}>
                        <label style={{ display: 'block', fontSize: 11, color: T.muted, marginBottom: 4 }}>{f.label}</label>
                        <input
                          type={f.type}
                          value={editForm[f.key] ?? ''}
                          onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>
                    ))}

                    {msg && <p style={{ fontSize: 13, color: msg.startsWith('✓') ? '#16a34a' : '#e74c3c', margin: '12px 0' }}>{msg}</p>}

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                        backgroundColor: T.gold, color: T.mode === 'dark' ? '#0D0D0D' : '#FFFFFF',
                        fontSize: 14, fontWeight: 700,
                        cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, marginTop: 4,
                      }}
                    >
                      {saving ? '儲存中...' : '儲存變更'}
                    </button>
                  </>
                )}

                {editTab === 'images' && (
                  <div>
                    {SLOTS.map(slot => {
                      const slotImages = images.filter(img => img.slot === slot.key);
                      return (
                        <div key={slot.key} style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{slot.label}</label>
                            <span style={{ fontSize: 11, color: T.muted }}>{slotImages.length} 張</span>
                          </div>

                          {/* Preview grid */}
                          {slotImages.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 8 }}>
                              {slotImages.map(img => (
                                <div key={img.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                                  <img
                                    src={`${API_HOST}${img.url}`}
                                    alt=""
                                    style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }}
                                  />
                                  <button
                                    onClick={() => handleDeleteImage(editing.id, img.id)}
                                    style={{
                                      position: 'absolute', top: 4, right: 4,
                                      width: 22, height: 22, borderRadius: '50%',
                                      backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                                      border: 'none', cursor: 'pointer', fontSize: 12,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                    title="刪除圖片"
                                  >×</button>
                                  {img.sort_order === 0 && (
                                    <span style={{
                                      position: 'absolute', bottom: 4, left: 4,
                                      padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 600,
                                      backgroundColor: T.gold, color: '#000',
                                    }}>主要</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Current URL preview (from external source) */}
                          {slotImages.length === 0 && editing[`image_url${slot.key === 'main' ? '' : `_${slot.key}`}` as keyof AdminCar] && (
                            <div style={{ marginBottom: 8, borderRadius: 6, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                              <img
                                src={editing[`image_url${slot.key === 'main' ? '' : `_${slot.key}`}` as keyof AdminCar] as string}
                                alt=""
                                style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }}
                                onError={e => (e.currentTarget.style.display = 'none')}
                              />
                              <p style={{ fontSize: 10, color: T.muted, padding: '4px 8px', margin: 0 }}>目前使用外部圖片</p>
                            </div>
                          )}

                          {/* Upload button */}
                          <label style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '10px 0', borderRadius: 6,
                            border: `1px dashed ${T.border}`, cursor: 'pointer',
                            fontSize: 12, color: T.muted,
                            backgroundColor: 'transparent',
                            transition: 'border-color 0.15s',
                          }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = T.gold)}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
                          >
                            {uploading === slot.key ? '上傳中...' : '+ 上傳圖片'}
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              style={{ display: 'none' }}
                              onChange={e => {
                                if (e.target.files && e.target.files.length > 0) {
                                  handleUpload(editing.id, slot.key, e.target.files);
                                  e.target.value = '';
                                }
                              }}
                            />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'users' && (
          <div style={{ backgroundColor: T.card, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: T.bgSecondary }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>名稱</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>角色</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: T.muted, fontWeight: 600 }}>建立時間</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}`, backgroundColor: i % 2 === 0 ? 'transparent' : T.rowAlt }}>
                    <td style={{ padding: '10px 12px', color: T.muted }}>{u.id}</td>
                    <td style={{ padding: '10px 12px' }}>{u.name}</td>
                    <td style={{ padding: '10px 12px', color: T.muted }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding:         '2px 8px',
                        borderRadius:    4,
                        fontSize:        11,
                        fontWeight:      600,
                        backgroundColor: u.role === 'admin' ? (T.mode === 'dark' ? 'rgba(232,197,71,0.15)' : 'rgba(184,146,10,0.1)') : T.pillBg,
                        color:           u.role === 'admin' ? T.gold : T.muted,
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: T.muted, fontSize: 12 }}>{new Date(u.created_at).toLocaleDateString('zh-TW')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
