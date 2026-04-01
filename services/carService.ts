import { FECar, FECarsResponse, FECarFilters, MakeOption, ClassOption, SiteStats } from '../types';
import { API_BASE as BASE } from './api';

// Retry wrapper for cold start handling (Render free tier sleeps after 15min)
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retries = 3,
  delay = 2000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return res;
      if (res.status >= 500 && i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Server unavailable after retries');
}

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

  const res = await fetchWithRetry(`${BASE}/cars?${p}`);
  if (!res.ok) throw new Error(`fetchCars ${res.status}`);
  return res.json();
}

export async function fetchCarById(id: number): Promise<FECar> {
  const res = await fetchWithRetry(`${BASE}/cars/${id}`);
  if (!res.ok) throw new Error(`fetchCarById ${res.status}`);
  return (await res.json()).car;
}

export async function fetchMakes(): Promise<MakeOption[]> {
  const res = await fetchWithRetry(`${BASE}/cars/makes`);
  if (!res.ok) return [];
  return (await res.json()).makes ?? [];
}

export async function fetchClasses(): Promise<ClassOption[]> {
  const res = await fetchWithRetry(`${BASE}/cars/classes`);
  if (!res.ok) return [];
  return (await res.json()).classes ?? [];
}

export async function fetchStats(): Promise<SiteStats> {
  const res = await fetchWithRetry(`${BASE}/cars/stats`);
  if (!res.ok) return { total: 0, makes: 0, evCount: 0, avgMpg: 0 };
  return res.json();
}

export async function triggerSeed(): Promise<{ status: string; total: number; message: string }> {
  const res = await fetchWithRetry(`${BASE}/cars/seed`);
  return res.json();
}

export async function fetchSeedStatus(): Promise<{ seeding: boolean; done: number; total: number; errors: number }> {
  const res = await fetchWithRetry(`${BASE}/cars/seed/status`);
  return res.json();
}
