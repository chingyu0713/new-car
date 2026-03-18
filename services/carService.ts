import { FECar, FECarsResponse, FECarFilters, MakeOption, ClassOption, SiteStats } from '../types';

// Production: Render backend, Development: localhost
const BASE = import.meta.env.DEV
  ? 'http://localhost:5001/api'
  : 'https://autospec-backend.onrender.com/api';

export async function fetchCars(filters: FECarFilters = {}, page = 1): Promise<FECarsResponse> {
  const p = new URLSearchParams();
  if (filters.make)      p.set('make',      filters.make);
  if (filters.class)     p.set('class',     filters.class);
  if (filters.year)      p.set('year',      String(filters.year));
  if (filters.fuel_type) p.set('fuel_type', filters.fuel_type);
  if (filters.drive)     p.set('drive',     filters.drive);
  if (filters.search)    p.set('search',    filters.search);
  if (filters.sort)      p.set('sort',      filters.sort);
  p.set('page',  String(page));
  p.set('limit', String(filters.limit ?? 21));

  const res = await fetch(`${BASE}/cars?${p}`);
  if (!res.ok) throw new Error(`fetchCars ${res.status}`);
  return res.json();
}

export async function fetchCarById(id: number): Promise<FECar> {
  const res = await fetch(`${BASE}/cars/${id}`);
  if (!res.ok) throw new Error(`fetchCarById ${res.status}`);
  return (await res.json()).car;
}

export async function fetchMakes(): Promise<MakeOption[]> {
  const res = await fetch(`${BASE}/cars/makes`);
  if (!res.ok) return [];
  return (await res.json()).makes ?? [];
}

export async function fetchClasses(): Promise<ClassOption[]> {
  const res = await fetch(`${BASE}/cars/classes`);
  if (!res.ok) return [];
  return (await res.json()).classes ?? [];
}

export async function fetchStats(): Promise<SiteStats> {
  const res = await fetch(`${BASE}/cars/stats`);
  if (!res.ok) return { total: 0, makes: 0, evCount: 0, avgMpg: 0 };
  return res.json();
}

export async function triggerSeed(): Promise<{ status: string; total: number; message: string }> {
  const res = await fetch(`${BASE}/cars/seed`);
  return res.json();
}

export async function fetchSeedStatus(): Promise<{ seeding: boolean; done: number; total: number; errors: number }> {
  const res = await fetch(`${BASE}/cars/seed/status`);
  return res.json();
}
