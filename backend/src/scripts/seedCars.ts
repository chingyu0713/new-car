import pool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

function getCarImage(make: string, model: string, year: number, angle = '29'): string {
  const url = new URL('https://cdn.imagin.studio/getimage');
  url.searchParams.append('customer', 'img');
  url.searchParams.append('make', make.toLowerCase().replace(/-/g, ''));
  url.searchParams.append('modelFamily', model.split(' ')[0].toLowerCase());
  url.searchParams.append('modelYear', String(year));
  url.searchParams.append('zoomType', 'fullscreen');
  url.searchParams.append('angle', angle);
  return url.toString();
}

interface UsedCar {
  external_id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body_type: string;
  fuel_type: string;
  transmission: string;
  engine: string;
  horsepower: number;
  msrp: number;
  price: number;
  mileage: number;
  exterior_color: string;
  interior_color: string;
  condition: string;
  location_city: string;
  location_state: string;
  description: string;
  image_url: string;
}

const USED_CARS: UsedCar[] = [
  // ── BMW ──────────────────────────────────────────────────────────
  {
    external_id: 'u-bmw-3series-2019-1',
    year: 2019, make: 'BMW', model: '3 Series', trim: '330i xDrive',
    body_type: 'Sedan', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '2.0L 4cyl Turbo', horsepower: 255,
    msrp: 41450, price: 28900, mileage: 31200,
    exterior_color: 'Alpine White', interior_color: 'Black SensaTec',
    condition: 'Excellent', location_city: 'San Jose', location_state: 'CA',
    description: 'Single-owner 330i with full BMW dealer service history and no accidents. Recently replaced brake pads and rotors; tires have over 60% tread remaining.',
    image_url: getCarImage('BMW', '3 Series', 2019),
  },
  {
    external_id: 'u-bmw-x5-2020-1',
    year: 2020, make: 'BMW', model: 'X5', trim: 'xDrive40i',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '3.0L 6cyl Turbo', horsepower: 335,
    msrp: 61700, price: 48500, mileage: 22400,
    exterior_color: 'Phytonic Blue Metallic', interior_color: 'Cognac Vernasca Leather',
    condition: 'Excellent', location_city: 'Seattle', location_state: 'WA',
    description: 'Loaded xDrive40i with panoramic roof, Harman Kardon audio, and Live Cockpit Professional. Garage kept and dealer serviced; all original equipment present.',
    image_url: getCarImage('BMW', 'X5', 2020),
  },
  {
    external_id: 'u-bmw-m4-2021-1',
    year: 2021, make: 'BMW', model: 'M4', trim: 'Competition',
    body_type: 'Coupe', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '3.0L 6cyl Twin-Turbo', horsepower: 503,
    msrp: 76900, price: 62000, mileage: 15800,
    exterior_color: 'Sao Paulo Yellow', interior_color: 'Black Merino Leather',
    condition: 'Excellent', location_city: 'Chicago', location_state: 'IL',
    description: 'Low-mileage M4 Competition with factory M Carbon bucket seats and carbon fiber trim package. Clean Carfax with one private owner; no track days on record.',
    image_url: getCarImage('BMW', 'M4', 2021),
  },
  // ── Mercedes-Benz ─────────────────────────────────────────────────
  {
    external_id: 'u-mercedes-cclass-2019-1',
    year: 2019, make: 'Mercedes-Benz', model: 'C-Class', trim: 'C300 4MATIC',
    body_type: 'Sedan', fuel_type: 'Gasoline', transmission: '9-Speed Automatic',
    engine: '2.0L 4cyl Turbo', horsepower: 255,
    msrp: 44600, price: 31500, mileage: 38400,
    exterior_color: 'Polar White', interior_color: 'Silk Beige Leather',
    condition: 'Good', location_city: 'Boston', location_state: 'MA',
    description: 'Well-maintained C300 with Burmester surround sound and panoramic sunroof. Minor wear consistent with age; tires and brakes recently serviced at Mercedes dealer.',
    image_url: getCarImage('Mercedes-Benz', 'C-Class', 2019),
  },
  {
    external_id: 'u-mercedes-gle-2020-1',
    year: 2020, make: 'Mercedes-Benz', model: 'GLE', trim: 'GLE450 4MATIC',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '9-Speed Automatic',
    engine: '3.0L 6cyl Turbo', horsepower: 362,
    msrp: 57900, price: 52900, mileage: 19600,
    exterior_color: 'Obsidian Black Metallic', interior_color: 'Macchiato Beige/Espresso Brown Nappa',
    condition: 'Excellent', location_city: 'Dallas', location_state: 'TX',
    description: 'GLE450 with third-row seating, AMG Line exterior, and MBUX infotainment with augmented reality navigation. One corporate owner with immaculate service records.',
    image_url: getCarImage('Mercedes-Benz', 'GLE', 2020),
  },
  // ── Porsche ───────────────────────────────────────────────────────
  {
    external_id: 'u-porsche-911-2018-1',
    year: 2018, make: 'Porsche', model: '911', trim: 'Carrera S',
    body_type: 'Coupe', fuel_type: 'Gasoline', transmission: '7-Speed PDK',
    engine: '3.0L 6cyl Twin-Turbo', horsepower: 420,
    msrp: 115000, price: 89500, mileage: 18200,
    exterior_color: 'Guards Red', interior_color: 'Black Standard Leather',
    condition: 'Excellent', location_city: 'Miami', location_state: 'FL',
    description: 'Pristine Carrera S with Sport Chrono Package, PASM, and Bose surround sound. Dry-climate car with clean Carfax; Porsche certified pre-ownership inspection available.',
    image_url: getCarImage('Porsche', '911', 2018),
  },
  {
    external_id: 'u-porsche-cayenne-2020-1',
    year: 2020, make: 'Porsche', model: 'Cayenne', trim: 'S',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '8-Speed Tiptronic S',
    engine: '2.9L 6cyl Biturbo', horsepower: 434,
    msrp: 85900, price: 68000, mileage: 24100,
    exterior_color: 'Mahogany Metallic', interior_color: 'Bordeaux Red Leather',
    condition: 'Excellent', location_city: 'Austin', location_state: 'TX',
    description: 'Cayenne S with panoramic fixed glass roof, 18-way adaptive sport seats, and Porsche Dynamic Chassis Control. All Porsche dealer service; never smoked in.',
    image_url: getCarImage('Porsche', 'Cayenne', 2020),
  },
  {
    external_id: 'u-porsche-macan-2019-1',
    year: 2019, make: 'Porsche', model: 'Macan', trim: 'GTS',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '7-Speed PDK',
    engine: '2.9L 6cyl Biturbo', horsepower: 375,
    msrp: 73200, price: 44500, mileage: 42300,
    exterior_color: 'Night Blue Metallic', interior_color: 'Black/Bordeaux Red Alcantara',
    condition: 'Good', location_city: 'Portland', location_state: 'OR',
    description: 'Rare GTS spec with Sport Chrono, PDLS headlights, and Sport Design steering wheel. Two owners; minor scuff on rear bumper cosmetically corrected.',
    image_url: getCarImage('Porsche', 'Macan', 2019),
  },
  // ── Audi ──────────────────────────────────────────────────────────
  {
    external_id: 'u-audi-a4-2021-1',
    year: 2021, make: 'Audi', model: 'A4', trim: 'Premium Plus 45 TFSI',
    body_type: 'Sedan', fuel_type: 'Gasoline', transmission: '7-Speed S Tronic',
    engine: '2.0L 4cyl Turbo', horsepower: 261,
    msrp: 44900, price: 36800, mileage: 18900,
    exterior_color: 'Glacier White Metallic', interior_color: 'Rock Gray Leather',
    condition: 'Excellent', location_city: 'Denver', location_state: 'CO',
    description: 'Premium Plus with Virtual Cockpit, Bang & Olufsen 3D sound, and power folding mirrors. One owner with all Audi dealer maintenance; clean title and Carfax.',
    image_url: getCarImage('Audi', 'A4', 2021),
  },
  {
    external_id: 'u-audi-q5-2020-1',
    year: 2020, make: 'Audi', model: 'Q5', trim: 'Prestige 45 TFSI',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '7-Speed S Tronic',
    engine: '2.0L 4cyl Turbo', horsepower: 261,
    msrp: 53000, price: 39200, mileage: 33700,
    exterior_color: 'Navarra Blue Metallic', interior_color: 'Beige Valcona Leather',
    condition: 'Good', location_city: 'Phoenix', location_state: 'AZ',
    description: 'Top-spec Prestige trim with head-up display, 360-degree cameras, and massage front seats. Second owner; all service records present and tires have 70% life remaining.',
    image_url: getCarImage('Audi', 'Q5', 2020),
  },
  // ── Toyota ────────────────────────────────────────────────────────
  {
    external_id: 'u-toyota-camry-2022-1',
    year: 2022, make: 'Toyota', model: 'Camry', trim: 'XSE V6',
    body_type: 'Sedan', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '3.5L 6cyl', horsepower: 301,
    msrp: 34000, price: 29500, mileage: 14200,
    exterior_color: 'Midnight Black Metallic', interior_color: 'Black SofTex',
    condition: 'Excellent', location_city: 'Atlanta', location_state: 'GA',
    description: 'Low-mileage XSE V6 with sport suspension, two-tone paint, and 19-inch dark-finish wheels. One private owner; oil changes every 5,000 miles at Toyota dealer.',
    image_url: getCarImage('Toyota', 'Camry', 2022),
  },
  {
    external_id: 'u-toyota-rav4-2021-1',
    year: 2021, make: 'Toyota', model: 'RAV4', trim: 'XLE Premium AWD',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '2.5L 4cyl', horsepower: 203,
    msrp: 31000, price: 32800, mileage: 21500,
    exterior_color: 'Magnetic Gray Metallic', interior_color: 'Nutmeg SofTex',
    condition: 'Excellent', location_city: 'Nashville', location_state: 'TN',
    description: 'XLE Premium with panoramic moonroof, heated and ventilated front seats, and wireless Apple CarPlay. Toyota Care service history; no accidents reported.',
    image_url: getCarImage('Toyota', 'RAV4', 2021),
  },
  // ── Honda ─────────────────────────────────────────────────────────
  {
    external_id: 'u-honda-civic-2022-1',
    year: 2022, make: 'Honda', model: 'Civic', trim: 'Sport',
    body_type: 'Sedan', fuel_type: 'Gasoline', transmission: 'CVT',
    engine: '1.5L 4cyl Turbo', horsepower: 158,
    msrp: 24200, price: 22900, mileage: 12800,
    exterior_color: 'Rallye Red', interior_color: 'Black Cloth',
    condition: 'Excellent', location_city: 'Raleigh', location_state: 'NC',
    description: 'Nearly-new Sport with 18-inch alloys, Honda Sensing suite, and rear spoiler. One owner from new; all 5,000-mile oil changes performed at Honda dealer.',
    image_url: getCarImage('Honda', 'Civic', 2022),
  },
  {
    external_id: 'u-honda-crv-2021-1',
    year: 2021, make: 'Honda', model: 'CR-V', trim: 'EX-L AWD',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: 'CVT',
    engine: '1.5L 4cyl Turbo', horsepower: 190,
    msrp: 32600, price: 28500, mileage: 27300,
    exterior_color: 'Sonic Gray Pearl', interior_color: 'Gray Leather',
    condition: 'Good', location_city: 'Minneapolis', location_state: 'MN',
    description: 'EX-L with hands-free power tailgate, heated leather seats, and Apple CarPlay. Minnesota-garaged; surface rust-free with all service performed at Honda dealer.',
    image_url: getCarImage('Honda', 'CR-V', 2021),
  },
  // ── Ford ──────────────────────────────────────────────────────────
  {
    external_id: 'u-ford-mustang-2020-1',
    year: 2020, make: 'Ford', model: 'Mustang', trim: 'GT Premium',
    body_type: 'Coupe', fuel_type: 'Gasoline', transmission: '10-Speed Automatic',
    engine: '5.0L 8cyl', horsepower: 460,
    msrp: 38500, price: 36200, mileage: 28900,
    exterior_color: 'Twister Orange', interior_color: 'Ebony Leather',
    condition: 'Good', location_city: 'Las Vegas', location_state: 'NV',
    description: 'GT Premium with active valve performance exhaust, B&O Play audio, and Recararo front seats. Two owners; minor stone chips on hood professionally touched up.',
    image_url: getCarImage('Ford', 'Mustang', 2020),
  },
  {
    external_id: 'u-ford-f150-2021-1',
    year: 2021, make: 'Ford', model: 'F-150', trim: 'Lariat SuperCrew 4x4',
    body_type: 'Truck', fuel_type: 'Gasoline', transmission: '10-Speed Automatic',
    engine: '3.5L 6cyl PowerBoost Hybrid', horsepower: 430,
    msrp: 55000, price: 42500, mileage: 19800,
    exterior_color: 'Stone Gray Metallic', interior_color: 'Camel Brown Leather',
    condition: 'Excellent', location_city: 'Houston', location_state: 'TX',
    description: 'Lariat with Pro Power Onboard 7.2kW generator, 360-degree camera, and Max Recline seats. Ranch-stored and never towed; immaculate bed with original liner.',
    image_url: getCarImage('Ford', 'F-150', 2021),
  },
  // ── Tesla ─────────────────────────────────────────────────────────
  {
    external_id: 'u-tesla-model3-2021-1',
    year: 2021, make: 'Tesla', model: 'Model 3', trim: 'Long Range AWD',
    body_type: 'Sedan', fuel_type: 'Electric', transmission: 'Single-Speed',
    engine: 'Dual Motor Electric', horsepower: 346,
    msrp: 48190, price: 38500, mileage: 29200,
    exterior_color: 'Pearl White Multi-Coat', interior_color: 'Black Premium',
    condition: 'Excellent', location_city: 'San Francisco', location_state: 'CA',
    description: 'Long Range with enhanced autopilot and full self-driving capability subscription. Battery health at 97%; supercharger access history available; no accidents.',
    image_url: getCarImage('Tesla', 'Model 3', 2021),
  },
  {
    external_id: 'u-tesla-modely-2022-1',
    year: 2022, make: 'Tesla', model: 'Model Y', trim: 'Performance AWD',
    body_type: 'SUV', fuel_type: 'Electric', transmission: 'Single-Speed',
    engine: 'Dual Motor Electric', horsepower: 456,
    msrp: 67990, price: 49800, mileage: 18400,
    exterior_color: 'Midnight Silver Metallic', interior_color: 'White Vegan Leather',
    condition: 'Excellent', location_city: 'Los Angeles', location_state: 'CA',
    description: 'Performance spec with 21-inch Überturbine wheels and track mode. Full self-driving hardware 3.0; battery at 96% health with no Supercharger throttling reported.',
    image_url: getCarImage('Tesla', 'Model Y', 2022),
  },
  {
    external_id: 'u-tesla-models-2020-1',
    year: 2020, make: 'Tesla', model: 'Model S', trim: 'Long Range Plus',
    body_type: 'Sedan', fuel_type: 'Electric', transmission: 'Single-Speed',
    engine: 'Dual Motor Electric', horsepower: 670,
    msrp: 79990, price: 62500, mileage: 41200,
    exterior_color: 'Deep Blue Metallic', interior_color: 'Cream Premium',
    condition: 'Good', location_city: 'New York', location_state: 'NY',
    description: 'Model S Long Range Plus with enhanced autopilot and premium interior package. Battery at 91% health; second owner with complete Tesla service history.',
    image_url: getCarImage('Tesla', 'Model S', 2020),
  },
  // ── Lexus ─────────────────────────────────────────────────────────
  {
    external_id: 'u-lexus-rx-2020-1',
    year: 2020, make: 'Lexus', model: 'RX', trim: 'RX350 F Sport',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '3.5L 6cyl', horsepower: 295,
    msrp: 51400, price: 42800, mileage: 22600,
    exterior_color: 'Eminent White Pearl', interior_color: 'Rioja Red F Sport Leather',
    condition: 'Excellent', location_city: 'Washington', location_state: 'DC',
    description: 'F Sport with adaptive variable suspension, Mark Levinson premium audio, and blind-spot monitoring with rear cross-traffic alert. Diplomat-owned; full Lexus service history.',
    image_url: getCarImage('Lexus', 'RX', 2020),
  },
  {
    external_id: 'u-lexus-es-2021-1',
    year: 2021, make: 'Lexus', model: 'ES', trim: 'ES350 Ultra Luxury',
    body_type: 'Sedan', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '3.5L 6cyl', horsepower: 302,
    msrp: 52440, price: 38200, mileage: 16100,
    exterior_color: 'Obsidian', interior_color: 'Flaxen Semi-Aniline Leather',
    condition: 'Excellent', location_city: 'Philadelphia', location_state: 'PA',
    description: 'Ultra Luxury package with 28-way power front seats, panoramic glass roof, and Lexus Safety System+ 2.5. One senior owner; 5,000-mile Lexus dealer service intervals.',
    image_url: getCarImage('Lexus', 'ES', 2021),
  },
  // ── Volkswagen ────────────────────────────────────────────────────
  {
    external_id: 'u-vw-golf-2020-1',
    year: 2020, make: 'Volkswagen', model: 'Golf', trim: 'GTI Autobahn',
    body_type: 'Hatchback', fuel_type: 'Gasoline', transmission: '7-Speed DSG',
    engine: '2.0L 4cyl Turbo', horsepower: 228,
    msrp: 35995, price: 28900, mileage: 31500,
    exterior_color: 'Tornado Red', interior_color: 'Clark Plaid / Black Leather',
    condition: 'Good', location_city: 'San Diego', location_state: 'CA',
    description: 'Autobahn spec with DCC adaptive chassis, 18-inch Pretoria wheels, and Harman Kardon audio. Two owners; timing belt and water pump replaced at 25,000 miles.',
    image_url: getCarImage('Volkswagen', 'Golf', 2020),
  },
  {
    external_id: 'u-vw-jetta-2021-1',
    year: 2021, make: 'Volkswagen', model: 'Jetta', trim: 'SEL',
    body_type: 'Sedan', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '1.4L 4cyl Turbo', horsepower: 147,
    msrp: 26890, price: 24500, mileage: 18700,
    exterior_color: 'Platinum Gray Metallic', interior_color: 'V-Tex Leatherette',
    condition: 'Excellent', location_city: 'Charlotte', location_state: 'NC',
    description: 'Top SEL trim with panoramic sunroof, heated front seats, and IQ.DRIVE safety suite. Single owner; clean Carfax and all 10,000-mile VW dealer service intervals met.',
    image_url: getCarImage('Volkswagen', 'Jetta', 2021),
  },
  {
    external_id: 'u-vw-tiguan-2020-1',
    year: 2020, make: 'Volkswagen', model: 'Tiguan', trim: 'SEL R-Line 4Motion',
    body_type: 'SUV', fuel_type: 'Gasoline', transmission: '8-Speed Automatic',
    engine: '2.0L 4cyl Turbo', horsepower: 184,
    msrp: 37395, price: 31800, mileage: 29400,
    exterior_color: 'Deep Black Pearl', interior_color: 'Titan Black Leather',
    condition: 'Good', location_city: 'Columbus', location_state: 'OH',
    description: 'R-Line with third-row seating, panoramic sunroof, and Fender premium audio. Two owners; minor cosmetic scuff on driver door sill bar; otherwise very clean.',
    image_url: getCarImage('Volkswagen', 'Tiguan', 2020),
  },
];

async function runMigration(client: any) {
  console.log('Running migration 002...');
  await client.query(`
    ALTER TABLE cars
      ADD COLUMN IF NOT EXISTS mileage        INTEGER,
      ADD COLUMN IF NOT EXISTS price          INTEGER,
      ADD COLUMN IF NOT EXISTS exterior_color VARCHAR(100),
      ADD COLUMN IF NOT EXISTS interior_color VARCHAR(100),
      ADD COLUMN IF NOT EXISTS condition      VARCHAR(50),
      ADD COLUMN IF NOT EXISTS location_city  VARCHAR(100),
      ADD COLUMN IF NOT EXISTS location_state VARCHAR(50),
      ADD COLUMN IF NOT EXISTS description    TEXT;
    CREATE INDEX IF NOT EXISTS idx_cars_price     ON cars(price);
    CREATE INDEX IF NOT EXISTS idx_cars_condition ON cars(condition);
    CREATE INDEX IF NOT EXISTS idx_cars_mileage   ON cars(mileage);
  `);
  console.log('Migration 002 complete');
}

async function insertCars(cars: UsedCar[]): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await runMigration(client);
    await client.query('DELETE FROM cars');

    let inserted = 0;
    for (const car of cars) {
      await client.query(
        `INSERT INTO cars
          (external_id, year, make, model, trim, body_type, fuel_type, transmission,
           engine, horsepower, msrp, price, mileage, exterior_color, interior_color,
           condition, location_city, location_state, description, image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
         ON CONFLICT DO NOTHING`,
        [
          car.external_id, car.year, car.make, car.model, car.trim,
          car.body_type, car.fuel_type, car.transmission, car.engine, car.horsepower,
          car.msrp, car.price, car.mileage, car.exterior_color, car.interior_color,
          car.condition, car.location_city, car.location_state, car.description, car.image_url,
        ]
      );
      inserted++;
    }

    await client.query('COMMIT');
    console.log(`✅ Inserted ${inserted} cars`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function seed() {
  console.log('🌱 Seeding 24 curated used cars...');
  const byMake: Record<string, number> = {};
  for (const c of USED_CARS) byMake[c.make] = (byMake[c.make] ?? 0) + 1;
  for (const [make, count] of Object.entries(byMake)) console.log(`  ${make}: ${count}`);

  await insertCars(USED_CARS);
  await pool.end();
  console.log('✅ Seed complete');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
