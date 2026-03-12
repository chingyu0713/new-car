import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  try {
    console.log('🔄 Running database migrations...');

    // Read and execute schema.sql
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schemaSQL);

    console.log('✅ Database schema created successfully');

    // Check if we need to seed data
    const { rows } = await pool.query('SELECT COUNT(*) FROM cars');
    const carCount = parseInt(rows[0].count);

    if (carCount === 0) {
      console.log('🌱 Seeding initial data...');
      await seedData();
      console.log('✅ Data seeded successfully');
    } else {
      console.log(`ℹ️  Database already has ${carCount} cars, skipping seed`);
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function seedData() {
  // Seed cars from frontend constants
  const carsData = [
    {
      brand: 'Toyota', model: 'Camry', year: 2024, type: 'Sedan', price: 1200000,
      description: '舒適穩重的中型房車，適合家庭使用',
      engine: '2.5L 直列四缸', horsepower: 203, torque: 243, acceleration: 8.2,
      top_speed: 210, fuel_efficiency: 14.5, transmission: '8速自排',
      drivetrain: '前置前驅', seating_capacity: 5, cargo_space: 524,
      length: 4885, width: 1840, height: 1445, weight: 1530,
      features: '["車道偏離警示", "盲點偵測", "全景天窗", "真皮座椅"]'
    },
    {
      brand: 'Honda', model: 'CR-V', year: 2024, type: 'SUV', price: 1350000,
      description: '實用性與舒適性兼具的都市SUV',
      engine: '1.5L 渦輪增壓', horsepower: 193, torque: 243, acceleration: 9.1,
      top_speed: 190, fuel_efficiency: 13.8, transmission: 'CVT無段變速',
      drivetrain: '前置前驅', seating_capacity: 5, cargo_space: 1072,
      length: 4621, width: 1855, height: 1689, weight: 1620,
      features: '["倒車顯影", "電動尾門", "Apple CarPlay", "全景天窗"]'
    },
    {
      brand: 'Tesla', model: 'Model 3', year: 2024, type: 'Sedan', price: 1680000,
      description: '科技感十足的電動轎車',
      engine: '雙馬達全輪驅動', horsepower: 480, torque: 640, acceleration: 3.3,
      top_speed: 261, fuel_efficiency: 0, transmission: '單速變速箱',
      drivetrain: '雙馬達四驅', seating_capacity: 5, cargo_space: 561,
      length: 4694, width: 1849, height: 1443, weight: 1847,
      features: '["自動駕駛輔助", "15吋觸控螢幕", "手機鑰匙", "OTA更新"]'
    },
    {
      brand: 'BMW', model: 'X5', year: 2024, type: 'SUV', price: 3500000,
      description: '豪華運動休旅的代表作',
      engine: '3.0L 直列六缸渦輪', horsepower: 335, torque: 450, acceleration: 5.5,
      top_speed: 250, fuel_efficiency: 10.2, transmission: '8速手自排',
      drivetrain: 'xDrive四驅', seating_capacity: 5, cargo_space: 650,
      length: 4922, width: 2004, height: 1745, weight: 2135,
      features: '["抬頭顯示器", "Harman Kardon音響", "全景天窗", "手勢控制"]'
    },
    {
      brand: 'Mazda', model: 'CX-5', year: 2024, type: 'SUV', price: 1150000,
      description: '駕駛樂趣與實用性的完美結合',
      engine: '2.5L 直列四缸', horsepower: 187, torque: 252, acceleration: 9.0,
      top_speed: 200, fuel_efficiency: 13.0, transmission: '6速手自排',
      drivetrain: '前置前驅', seating_capacity: 5, cargo_space: 875,
      length: 4575, width: 1842, height: 1685, weight: 1620,
      features: '["i-Activsense安全科技", "電動尾門", "抬頭顯示器", "Bose音響"]'
    },
    {
      brand: 'Mercedes-Benz', model: 'C-Class', year: 2024, type: 'Sedan', price: 2500000,
      description: '德國工藝的豪華轎車典範',
      engine: '2.0L 四缸渦輪', horsepower: 255, torque: 400, acceleration: 6.0,
      top_speed: 250, fuel_efficiency: 12.5, transmission: '9G-Tronic',
      drivetrain: '後輪驅動', seating_capacity: 5, cargo_space: 455,
      length: 4751, width: 1820, height: 1438, weight: 1640,
      features: '["MBUX多媒體系統", "64色氛圍燈", "Burmester音響", "主動式停車"]'
    },
    {
      brand: 'Hyundai', model: 'Tucson', year: 2024, type: 'SUV', price: 1050000,
      description: 'CP值極高的韓系SUV',
      engine: '1.6L 渦輪增壓', horsepower: 180, torque: 265, acceleration: 8.9,
      top_speed: 195, fuel_efficiency: 14.2, transmission: '7速雙離合',
      drivetrain: '前置前驅', seating_capacity: 5, cargo_space: 1095,
      length: 4500, width: 1865, height: 1650, weight: 1595,
      features: '["SmartSense安全系統", "無線充電", "數位儀表板", "遠端遙控"]'
    },
    {
      brand: 'Nissan', model: 'Altima', year: 2024, type: 'Sedan', price: 980000,
      description: '經濟實惠的中型房車選擇',
      engine: '2.0L 直列四缸', horsepower: 188, torque: 244, acceleration: 8.5,
      top_speed: 205, fuel_efficiency: 14.8, transmission: 'CVT',
      drivetrain: '前置前驅', seating_capacity: 5, cargo_space: 447,
      length: 4901, width: 1850, height: 1447, weight: 1520,
      features: '["ProPILOT智能駕駛", "盲點偵測", "8吋觸控螢幕", "雙區恆溫"]'
    }
  ];

  for (const car of carsData) {
    await pool.query(`
      INSERT INTO cars (
        brand, model, year, type, price, description,
        engine, horsepower, torque, acceleration, top_speed,
        fuel_efficiency, transmission, drivetrain, seating_capacity,
        cargo_space, length, width, height, weight, features, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    `, [
      car.brand, car.model, car.year, car.type, car.price, car.description,
      car.engine, car.horsepower, car.torque, car.acceleration, car.top_speed,
      car.fuel_efficiency, car.transmission, car.drivetrain, car.seating_capacity,
      car.cargo_space, car.length, car.width, car.height, car.weight,
      car.features,
      `https://picsum.photos/seed/${car.model}/800/600`
    ]);
  }
}

migrate();
