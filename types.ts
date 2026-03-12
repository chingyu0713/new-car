// ── FuelEconomy.gov car (from backend /api/cars) ─────────────────────────────

export interface FECar {
  id:             number;
  fuelEconomyId:  number;
  make:           string;
  makeZh:         string;
  model:          string;
  year:           number;
  trimDesc:       string | null;
  fuelType:       string | null;
  fuelTypeZh:     string | null;
  drive:          string | null;
  driveZh:        string | null;
  transmission:   string | null;
  transmissionZh: string | null;
  cylinders:      number | null;
  displacement:   number | null;
  vehicleClass:   string | null;
  vehicleClassZh: string | null;
  cityMpg:        number | null;
  highwayMpg:     number | null;
  combinedMpg:    number | null;
  cityMpgE:       number | null;
  highwayMpgE:    number | null;
  combinedMpgE:   number | null;
  rangeCity:      number | null;
  rangeHighway:   number | null;
  co2:            number | null;
  imageUrl:       string;
  imageUrlBanner: string;
  imageUrlDetail: string;
  cachedAt?:      string;
}

export interface FECarsResponse {
  cars:       FECar[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

export interface FECarFilters {
  make?:      string;
  class?:     string;
  year?:      number;
  fuel_type?: string;
  drive?:     string;
  search?:    string;
  sort?:      'year_desc' | 'year_asc' | 'make_asc' | 'mpg_desc' | 'newest';
  page?:      number;
  limit?:     number;
}

export interface MakeOption {
  make:   string;
  makeZh: string;
}

export interface ClassOption {
  cls:   string;
  clsZh: string;
}

export interface SiteStats {
  total:   number;
  makes:   number;
  evCount: number;
  avgMpg:  number;
}

// ── Unit conversion helpers ───────────────────────────────────────────────

/** mpg → km/L */
export function mpgToKmL(mpg: number | null): string {
  if (!mpg) return '—';
  return (mpg * 0.4251).toFixed(1);
}

/** mpg → L/100km */
export function mpgToL100(mpg: number | null): string {
  if (!mpg) return '—';
  return (235.21 / mpg).toFixed(1);
}

/** miles → km */
export function milesToKm(miles: number | null): string {
  if (!miles) return '—';
  return Math.round(miles * 1.60934).toString();
}

/** CO2 g/mile → g/km */
export function co2ToGkm(gpm: number | null): string {
  if (!gpm) return '—';
  return Math.round(gpm * 0.62137).toString();
}

// ── Legacy types (kept for Gemini AI service compatibility) ──────────────

export enum CarType {
  SUV = 'SUV', SEDAN = 'Sedan', HATCHBACK = 'Hatchback',
  COUPE = 'Coupe', EV = 'Electric', MPV = 'MPV'
}
export enum Brand {
  TOYOTA = 'Toyota', HONDA = 'Honda', TESLA = 'Tesla',
  BMW = 'BMW', MERCEDES = 'Mercedes-Benz', MAZDA = 'Mazda',
  FORD = 'Ford', PORSCHE = 'Porsche', NISSAN = 'Nissan',
  VOLKSWAGEN = 'Volkswagen', MITSUBISHI = 'Mitsubishi', LEXUS = 'Lexus'
}
export interface FilterState {
  minPrice: number; maxPrice: number;
  brand: string; type: string; keyword: string;
}
export interface AIRecommendation {
  reasoning: string; suggestedFilters: Partial<FilterState>;
}
export interface User { id: string; name: string; email: string; avatar: string; }
