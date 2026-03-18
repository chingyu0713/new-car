import { Request, Response } from 'express';
import pool from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';

const FEG_BASE = 'https://www.fueleconomy.gov/ws/rest';

// ── Translation tables ─────────────────────────────────────────────────────

const FUEL_ZH: Record<string, string> = {
  'regular gasoline':  '汽油',
  'premium gasoline':  '汽油',       // 統一歸類為汽油，前端不顯示此細分
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

function formatCar(row: any) {
  return {
    id:             row.id,
    fuelEconomyId:  row.fuel_economy_id,
    make:           row.make,
    makeZh:         row.make_zh,
    model:          row.model,
    year:           row.year,
    trimDesc:       row.trim_desc,
    fuelType:       row.fuel_type,
    fuelTypeZh:     row.fuel_type_zh,
    drive:          row.drive,
    driveZh:        row.drive_zh,
    transmission:   row.transmission,
    transmissionZh: row.transmission_zh,
    cylinders:      row.cylinders,
    displacement:   row.displacement ? parseFloat(row.displacement) : null,
    vehicleClass:   row.vehicle_class,
    vehicleClassZh: row.vehicle_class_zh,
    cityMpg:        row.city_mpg,
    highwayMpg:     row.highway_mpg,
    combinedMpg:    row.combined_mpg,
    cityMpgE:       row.city_mpg_e,
    highwayMpgE:    row.highway_mpg_e,
    combinedMpgE:   row.combined_mpg_e,
    rangeCity:      row.range_city,
    rangeHighway:   row.range_highway,
    co2:            row.co2,
    imageUrl:       row.image_url,
    imageUrlBanner: row.image_url_banner,
    imageUrlDetail: row.image_url_detail,
    cachedAt:       row.cached_at,
  };
}

// ── GET /api/cars ──────────────────────────────────────────────────────────

export const getAllCars = async (req: Request, res: Response): Promise<void> => {
  try {
    const { make, class: cls, year, fuel_type, drive, search } = req.query;
    const page   = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 21));
    const offset = (page - 1) * limit;

    const conds: string[] = [];
    const params: any[]   = [];
    let p = 1;

    if (make)      { conds.push(`make ILIKE $${p++}`);         params.push(`%${make}%`); }
    if (cls)       { conds.push(`vehicle_class ILIKE $${p++}`); params.push(`%${cls}%`); }
    if (year)      { conds.push(`year = $${p++}`);             params.push(Number(year)); }
    if (fuel_type) {
      const ft = (fuel_type as string).toLowerCase().trim();
      if (ft === 'regular gasoline') {
        // 「汽油」選項涵蓋 regular + premium + gasoline（前端已合併顯示）
        conds.push(`(fuel_type ILIKE $${p} OR fuel_type ILIKE $${p + 1} OR fuel_type = $${p + 2})`);
        params.push('%regular%gasoline%', '%premium%gasoline%', 'Gasoline'); p += 3;
      } else if (ft === 'electricity') {
        // 電動車包含 Electricity 和 Electric
        conds.push(`(fuel_type ILIKE $${p} OR fuel_type ILIKE $${p + 1})`);
        params.push('%electric%', '%electricity%'); p += 2;
      } else {
        conds.push(`fuel_type ILIKE $${p++}`);
        params.push(`%${fuel_type}%`);
      }
    }
    if (drive)     { conds.push(`drive ILIKE $${p++}`);        params.push(`%${drive}%`); }
    if (search)    {
      conds.push(`(make ILIKE $${p} OR model ILIKE $${p} OR make_zh ILIKE $${p})`);
      params.push(`%${search}%`); p++;
    }

    const ORDER_MAP: Record<string, string> = {
      year_desc:   'year DESC, make ASC',
      year_asc:    'year ASC,  make ASC',
      make_asc:    'make ASC,  year DESC',
      mpg_desc:    'combined_mpg DESC NULLS LAST',
      newest:      'cached_at DESC',
    };
    const sort    = (req.query.sort as string) ?? '';
    const orderBy = ORDER_MAP[sort] ?? 'year DESC, make ASC';

    const where    = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
    const countRes = await pool.query(`SELECT COUNT(*) FROM cars ${where}`, params);
    const total    = parseInt(countRes.rows[0].count);

    const dataRes = await pool.query(
      `SELECT * FROM cars ${where} ORDER BY ${orderBy} LIMIT $${p} OFFSET $${p + 1}`,
      [...params, limit, offset]
    );

    res.json({
      cars:       dataRes.rows.map(formatCar),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('getAllCars error:', err);
    res.status(500).json({ error: '取得車款列表時發生錯誤' });
  }
};

// ── GET /api/cars/makes ────────────────────────────────────────────────────

export const getMakes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT make, make_zh FROM cars ORDER BY make ASC`
    );
    res.json({ makes: result.rows.map((r: any) => ({ make: r.make, makeZh: r.make_zh })) });
  } catch (err) {
    res.status(500).json({ error: '取得廠牌清單時發生錯誤' });
  }
};

// ── GET /api/cars/classes ──────────────────────────────────────────────────

export const getClasses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT vehicle_class, vehicle_class_zh FROM cars
       WHERE vehicle_class IS NOT NULL
         AND vehicle_class NOT ILIKE 'minivan%'
       ORDER BY vehicle_class ASC`
    );
    res.json({ classes: result.rows.map((r: any) => ({ cls: r.vehicle_class, clsZh: r.vehicle_class_zh })) });
  } catch (err) {
    res.status(500).json({ error: '取得車型清單時發生錯誤' });
  }
};

// ── GET /api/cars/stats ────────────────────────────────────────────────────

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalRes, makeRes, evRes, mpgRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM cars`),
      pool.query(`SELECT COUNT(DISTINCT make) FROM cars`),
      pool.query(`SELECT COUNT(*) FROM cars WHERE fuel_type ILIKE '%electric%'`),
      pool.query(`SELECT ROUND(AVG(combined_mpg)) as avg FROM cars WHERE combined_mpg IS NOT NULL`),
    ]);
    res.json({
      total:   parseInt(totalRes.rows[0].count),
      makes:   parseInt(makeRes.rows[0].count),
      evCount: parseInt(evRes.rows[0].count),
      avgMpg:  parseInt(mpgRes.rows[0].avg) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: '取得統計資料時發生錯誤' });
  }
};

// ── GET /api/cars/:id ──────────────────────────────────────────────────────

export const getCarById = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: '找不到該車款' }); return; }
    res.json({ car: formatCar(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ error: '取得車款資料時發生錯誤' });
  }
};

// ── GET /api/cars/seed ─────────────────────────────────────────────────────

// 僅收錄台灣有銷售的品牌與車款（參考 8891.com.tw）
// 年份對應 FuelEconomy.gov 實際有資料的範圍
const SEED_LIST: { make: string; models: string[] }[] = [
  // 豐田：移除 Tacoma（皮卡）、4Runner、Tundra（台灣無）；C-HR 美國 2022 後停產跳過
  { make: 'Toyota',        models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Sienna', 'bZ4X'] },
  // 本田：移除 Pilot（台灣無）
  { make: 'Honda',         models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Odyssey'] },
  // 寶馬：補 X1
  { make: 'BMW',           models: ['3 Series', '5 Series', 'X1', 'X3', 'X5'] },
  // 賓士：A-Class 換掉 S-Class（台灣定位差異）
  { make: 'Mercedes-Benz', models: ['A-Class', 'C-Class', 'E-Class', 'GLC', 'GLE'] },
  // 特斯拉：全部台灣有售
  { make: 'Tesla',         models: ['Model 3', 'Model S', 'Model X', 'Model Y'] },
  // 福特：移除 F-150（皮卡）、Escape（台灣叫 Kuga）、Edge（台灣無）
  { make: 'Ford',          models: ['Mustang', 'Explorer', 'Bronco'] },
  // 保時捷：全部台灣有售
  { make: 'Porsche',       models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
  // 奧迪：全部台灣有售
  { make: 'Audi',          models: ['A4', 'A6', 'Q5', 'Q7', 'e-tron'] },
  // 現代：移除 Sonata（台灣停售）
  { make: 'Hyundai',       models: ['Elantra', 'Tucson', 'Santa Fe', 'IONIQ 5', 'IONIQ 6'] },
  // 起亞：移除 K5（台灣無）、Telluride（台灣無）；補 Sorento
  { make: 'Kia',           models: ['Forte', 'Sportage', 'Sorento', 'EV6'] },
  // 馬自達：移除 CX-9（台灣停售）；補 CX-50、MX-5 Miata
  { make: 'Mazda',         models: ['Mazda3', 'CX-5', 'CX-30', 'MX-5 Miata'] },
  // 凌志：補 UX
  { make: 'Lexus',         models: ['ES', 'IS', 'NX', 'RX', 'UX'] },
  // 速霸陸：全部台灣有售
  { make: 'Subaru',        models: ['Impreza', 'Forester', 'Outback', 'Crosstrek'] },
  // 福斯：移除 Jetta（台灣無）、Atlas（台灣無，美版大型 SUV）
  { make: 'Volkswagen',    models: ['Golf', 'Tiguan', 'ID.4'] },
  // 日產：移除 Altima（台灣無）、Murano（台灣無）；Rogue = 台灣 X-Trail
  { make: 'Nissan',        models: ['Sentra', 'Kicks', 'Rogue', 'LEAF'] },
  // 富豪：新增（台灣有售）
  { make: 'Volvo',         models: ['XC40', 'XC60', 'XC90', 'S60', 'V90'] },
  // 三菱：新增（台灣有售）
  { make: 'Mitsubishi',    models: ['Outlander', 'Eclipse Cross'] },
  // 鈴木：2012 年退出美國市場，FuelEconomy.gov 無 2023+ 資料，跳過
];
const SEED_YEARS = [2023, 2024, 2025];

let seedingInProgress = false;
let seedStats = { done: 0, total: 0, errors: 0 };

export const seedCars = async (_req: Request, res: Response): Promise<void> => {
  if (seedingInProgress) {
    res.json({ status: 'already_running', ...seedStats });
    return;
  }

  // Build task list
  const tasks: { make: string; model: string; year: number }[] = [];
  for (const { make, models } of SEED_LIST) {
    for (const model of models) {
      for (const year of SEED_YEARS) {
        tasks.push({ make, model, year });
      }
    }
  }

  seedStats = { done: 0, total: tasks.length, errors: 0 };
  seedingInProgress = true;
  res.json({ status: 'started', total: tasks.length, message: `開始從 FuelEconomy.gov 抓取資料，共 ${tasks.length} 個組合` });

  // Run in background
  (async () => {
    for (const { make, model, year } of tasks) {
      const ids = await fetchVehicleIds(make, model, year);
      if (ids.length === 0) {
        seedStats.errors++;
        console.log(`[seed] ⬜ no data: ${make} ${model} ${year}`);
      } else {
        for (const id of ids) {
          const vehicle = await fetchVehicle(id);
          if (vehicle) {
            try {
              await upsertVehicle(vehicle);
              seedStats.done++;
              console.log(`[seed] ✅ ${make} ${model} ${year} (id=${id})`);
            } catch (e) {
              seedStats.errors++;
              console.warn(`[seed] ⚠ upsert failed id=${id}:`, e);
            }
          } else {
            seedStats.errors++;
          }
          await new Promise(r => setTimeout(r, 60)); // ~60ms between requests
        }
      }
      await new Promise(r => setTimeout(r, 100)); // 100ms between make/model/year combos
    }
    seedingInProgress = false;
    console.log(`[seed] Done — ${seedStats.done} inserted, ${seedStats.errors} errors`);
  })();
};

export const seedStatus = async (_req: Request, res: Response): Promise<void> => {
  res.json({ seeding: seedingInProgress, ...seedStats });
};

// ── Legacy stubs ───────────────────────────────────────────────────────────

export const createCar = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(405).json({ error: '請使用 GET /api/cars/seed 抓取車款' });
};
export const updateCar = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(405).json({ error: '不支援直接更新車款' });
};
export const deleteCar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('DELETE FROM cars WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: '找不到該車款' }); return; }
    res.json({ message: '車款已刪除' });
  } catch (err) {
    res.status(500).json({ error: '刪除車款時發生錯誤' });
  }
};
export const fetchAndCache = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(405).json({ error: '請使用 GET /api/cars/seed' });
};
