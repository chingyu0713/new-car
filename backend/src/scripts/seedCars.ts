/**
 * CLI script to seed cars from FuelEconomy.gov API
 * Usage: npm run db:seed
 *
 * This script fetches vehicle data from FuelEconomy.gov and inserts it
 * into the local database using the same logic as GET /api/cars/seed.
 */
import pool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const FEG_BASE = 'https://www.fueleconomy.gov/ws/rest';

// ── Translation tables ─────────────────────────────────────────────────────

const FUEL_ZH: Record<string, string> = {
  'regular gasoline':  '汽油',
  'premium gasoline':  '汽油',
  'midgrade gasoline': '汽油',
  'diesel':            '柴油',
  'electricity':       '電動',
  'e85':               '乙醇汽油(E85)',
  'natural gas':       '天然氣',
  'hydrogen':          '氫燃料',
  'gasoline or e85':   '汽油/乙醇',
  'premium or e85':    '汽油/乙醇',
};

const DRIVE_ZH: Record<string, string> = {
  'front-wheel drive':         '前輪驅動(FWD)',
  'rear-wheel drive':          '後輪驅動(RWD)',
  'all-wheel drive':           '全輪驅動(AWD)',
  '4-wheel drive':             '四輪驅動(4WD)',
  '4-wheel or all-wheel drive':'四驅/全驅',
  'part-time 4-wheel drive':   '分時四驅',
  '2-wheel drive':             '二輪驅動',
};

const CLASS_ZH: Record<string, string> = {
  'compact cars':                      '緊湊型轎車',
  'midsize cars':                      '中型轎車',
  'large cars':                        '大型轎車',
  'minicompact cars':                  '迷你轎車',
  'subcompact cars':                   '小型轎車',
  'two seaters':                       '雙座跑車',
  'small pickup trucks 2wd':           '小型皮卡(後驅)',
  'small pickup trucks 4wd':           '小型皮卡(四驅)',
  'standard pickup trucks 2wd':        '皮卡(後驅)',
  'standard pickup trucks 4wd':        '皮卡(四驅)',
  'sport utility vehicles':            'SUV',
  'small sport utility vehicle 2wd':   '小型SUV(後驅)',
  'small sport utility vehicle 4wd':   '小型SUV(四驅)',
  'standard sport utility vehicle 2wd':'標準SUV(後驅)',
  'standard sport utility vehicle 4wd':'標準SUV(四驅)',
  'large sport utility vehicle':       '大型SUV',
  'small station wagons':              '小型旅行車',
  'midsize station wagons':            '中型旅行車',
  'minivans':                          '廂型車',
  'minivan - 2wd':                     '廂型車',
  'minivan - 4wd':                     '廂型車(四驅)',
  'large van':                         '大型廂型車',
  'vans':                              '廂型車',
  'vans, cargo type':                  '貨廂型車',
  'vans, passenger type':              '乘客廂型車',
  'special purpose vehicles':          '特殊用途車',
  'special purpose vehicles/4wd':      '特殊用途車(四驅)',
  'pickup trucks':                     '皮卡',
  'passenger cars':                    '轎車',
};

const MAKE_ZH: Record<string, string> = {
  'toyota':       '豐田',
  'honda':        '本田',
  'bmw':          '寶馬',
  'mercedes-benz':'賓士',
  'tesla':        '特斯拉',
  'ford':         '福特',
  'porsche':      '保時捷',
  'audi':         '奧迪',
  'hyundai':      '現代',
  'kia':          '起亞',
  'volkswagen':   '福斯',
  'chevrolet':    '雪佛蘭',
  'dodge':        '道奇',
  'jeep':         '吉普',
  'lexus':        '凌志',
  'infiniti':     '英菲尼迪',
  'acura':        '謳歌',
  'subaru':       '速霸陸',
  'mazda':        '馬自達',
  'volvo':        '富豪',
  'jaguar':       '捷豹',
  'land rover':   '路虎',
  'mitsubishi':   '三菱',
  'nissan':       '日產',
  'cadillac':     '凱迪拉克',
  'buick':        '別克',
  'gmc':          '通用',
  'lincoln':      '林肯',
  'ram':          '公羊',
  'genesis':      '捷尼賽思',
  'alfa romeo':   '愛快羅密歐',
  'maserati':     '瑪莎拉蒂',
  'mini':         'MINI',
  'fiat':         '飛雅特',
  'chrysler':     '克萊斯勒',
  'rivian':       '瑞文',
  'lucid':        '陸西德',
  'polestar':     '極星',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function translateFuel(v: string | null): string {
  if (!v) return '—';
  return FUEL_ZH[v.toLowerCase()] ?? v;
}
function translateDrive(v: string | null): string {
  if (!v) return '—';
  return DRIVE_ZH[v.toLowerCase()] ?? v;
}
function translateClass(v: string | null): string {
  if (!v) return '—';
  return CLASS_ZH[v.toLowerCase().trim()] ?? v;
}
function translateMake(v: string): string {
  return MAKE_ZH[v.toLowerCase()] ?? v;
}
function translateTransmission(t: string | null): string {
  if (!t) return '—';
  const lower = t.toLowerCase();
  const spdMatch = t.match(/(\d+)-spd/i);
  const spd = spdMatch ? `${spdMatch[1]}速` : '';
  if (lower.includes('cvt')) return 'CVT無段自動';
  if (lower.includes('automatic') || lower.startsWith('auto')) return spd ? `${spd}自動` : '自動';
  if (lower.includes('manual')) return spd ? `${spd}手動` : '手動';
  if (lower.includes('am-s') || lower.includes('sct')) return spd ? `${spd}序列式手動` : '序列式手動';
  return t;
}

const IMAGIN_MAKE: Record<string, string> = {
  'mercedes-benz': 'mercedesbenz',
  'land rover':    'landrover',
  'alfa romeo':    'alfaromeo',
};
function buildImageUrl(make: string, model: string, year: number, angle = '29'): string {
  const m  = IMAGIN_MAKE[make.toLowerCase()] ?? make.toLowerCase().replace(/[\s-]/g, '');
  const mf = model.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://cdn.imagin.studio/getimage?customer=img&make=${m}&modelFamily=${mf}&modelYear=${year}&zoomType=fullscreen&angle=${angle}`;
}

function safeNum(v: any): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return isFinite(n) && n > 0 ? n : null;
}

// ── FuelEconomy.gov fetch ──────────────────────────────────────────────────

async function fegGet(path: string): Promise<any | null> {
  try {
    const res = await fetch(`${FEG_BASE}${path}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function fetchVehicleIds(make: string, model: string, year: number): Promise<number[]> {
  const data = await fegGet(
    `/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`
  );
  if (!data?.menuItem) return [];
  const items = Array.isArray(data.menuItem) ? data.menuItem : [data.menuItem];
  return items.map((i: any) => Number(i.value)).filter(Boolean);
}

async function fetchVehicle(id: number): Promise<any | null> {
  return fegGet(`/vehicle/${id}`);
}

async function upsertVehicle(v: any): Promise<void> {
  const imageUrl        = buildImageUrl(v.make, v.model, v.year, '29');
  const imageUrlBanner  = buildImageUrl(v.make, v.model, v.year, '01');
  const imageUrlDetail  = buildImageUrl(v.make, v.model, v.year, '13');

  await pool.query(
    `INSERT INTO cars (
       fuel_economy_id, make, model, year, trim_desc,
       fuel_type, fuel_type_zh, drive, drive_zh,
       transmission, transmission_zh,
       cylinders, displacement, vehicle_class, vehicle_class_zh,
       city_mpg, highway_mpg, combined_mpg,
       city_mpg_e, highway_mpg_e, combined_mpg_e,
       range_city, range_highway, co2, make_zh,
       image_url, image_url_banner, image_url_detail
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
     )
     ON CONFLICT (fuel_economy_id) DO UPDATE SET
       make=$2, model=$3, year=$4, trim_desc=$5,
       fuel_type=$6, fuel_type_zh=$7, drive=$8, drive_zh=$9,
       transmission=$10, transmission_zh=$11,
       cylinders=$12, displacement=$13, vehicle_class=$14, vehicle_class_zh=$15,
       city_mpg=$16, highway_mpg=$17, combined_mpg=$18,
       city_mpg_e=$19, highway_mpg_e=$20, combined_mpg_e=$21,
       range_city=$22, range_highway=$23, co2=$24, make_zh=$25,
       image_url=$26, image_url_banner=$27, image_url_detail=$28,
       cached_at=NOW()`,
    [
      Number(v.id),
      v.make, v.model, Number(v.year),
      v.trany || null,
      v.fuelType1 || null, translateFuel(v.fuelType1),
      v.drive || null, translateDrive(v.drive),
      v.trany || null, translateTransmission(v.trany),
      safeNum(v.cylinders), safeNum(v.displ),
      v.VClass || null, translateClass(v.VClass),
      safeNum(v.city08), safeNum(v.highway08), safeNum(v.comb08),
      safeNum(v.cityA08), safeNum(v.highwayA08), safeNum(v.combA08),
      safeNum(v.rangeCity), safeNum(v.rangeHwy),
      safeNum(v.co2TailpipeGpm),
      translateMake(v.make),
      imageUrl, imageUrlBanner, imageUrlDetail,
    ]
  );
}

// ── Seed list (Taiwan market) ──────────────────────────────────────────────

const SEED_LIST: { make: string; models: string[] }[] = [
  { make: 'Toyota',        models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna', 'bZ4X'] },
  { make: 'Honda',         models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Odyssey'] },
  { make: 'BMW',           models: ['3 Series', '5 Series', 'X1', 'X3', 'X5'] },
  { make: 'Mercedes-Benz', models: ['A-Class', 'C-Class', 'E-Class', 'GLC', 'GLE'] },
  { make: 'Tesla',         models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
  { make: 'Ford',          models: ['Mustang', 'Explorer', 'Bronco'] },
  { make: 'Porsche',       models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
  { make: 'Audi',          models: ['A4', 'A6', 'Q5', 'Q7', 'e-tron'] },
  { make: 'Hyundai',       models: ['Elantra', 'Tucson', 'Santa Fe', 'IONIQ 5', 'IONIQ 6'] },
  { make: 'Kia',           models: ['Forte', 'Sportage', 'Sorento', 'EV6'] },
  { make: 'Mazda',         models: ['Mazda3', 'CX-5', 'CX-30', 'MX-5 Miata'] },
  { make: 'Lexus',         models: ['ES', 'IS', 'NX', 'RX', 'UX'] },
  { make: 'Subaru',        models: ['Impreza', 'Forester', 'Outback', 'Crosstrek'] },
  { make: 'Volkswagen',    models: ['Golf', 'Tiguan', 'ID.4'] },
  { make: 'Nissan',        models: ['Sentra', 'Kicks', 'Rogue', 'LEAF'] },
  { make: 'Volvo',         models: ['XC40', 'XC60', 'XC90', 'S60', 'V90'] },
  { make: 'Mitsubishi',    models: ['Outlander', 'Eclipse Cross'] },
];
const SEED_YEARS = [2023, 2024, 2025];

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚗 AutoSpec — Seeding cars from FuelEconomy.gov\n');

  const tasks: { make: string; model: string; year: number }[] = [];
  for (const { make, models } of SEED_LIST) {
    for (const model of models) {
      for (const year of SEED_YEARS) {
        tasks.push({ make, model, year });
      }
    }
  }

  console.log(`📋 Total combinations: ${tasks.length}\n`);

  let done = 0;
  let errors = 0;

  for (const { make, model, year } of tasks) {
    const ids = await fetchVehicleIds(make, model, year);
    if (ids.length === 0) {
      errors++;
      console.log(`⬜ no data: ${make} ${model} ${year}`);
    } else {
      for (const id of ids) {
        const vehicle = await fetchVehicle(id);
        if (vehicle) {
          try {
            await upsertVehicle(vehicle);
            done++;
            console.log(`✅ ${make} ${model} ${year} (id=${id})`);
          } catch (e) {
            errors++;
            console.warn(`⚠  upsert failed id=${id}:`, e);
          }
        } else {
          errors++;
        }
        await new Promise(r => setTimeout(r, 60));
      }
    }
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n🏁 Done — ${done} inserted, ${errors} errors`);
  await pool.end();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
