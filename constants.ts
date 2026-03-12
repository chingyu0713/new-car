import { Brand, Car, CarType } from './types';

// Using consistent seed based images from picsum or placeholders
export const MOCK_CARS: Car[] = [
  {
    id: '1',
    brand: Brand.TOYOTA,
    model: 'Corolla Cross',
    trim: 'Hybrid GR Sport',
    price: 980000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/111/800/600',
    specs: {
      horsepower: 122,
      torque: 142,
      acceleration: 10.9,
      fuelEconomy: 21.9,
      engine: '1.8L Hybrid',
      dimensions: '4460 x 1825 x 1620 mm'
    },
    features: ['TSS 3.0', 'Apple CarPlay', '360度環景']
  },
  {
    id: '2',
    brand: Brand.TOYOTA,
    model: 'RAV4',
    trim: '2.0 Adventure',
    price: 1250000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/133/800/600',
    specs: {
      horsepower: 173,
      torque: 207,
      acceleration: 9.8,
      fuelEconomy: 15.1,
      engine: '2.0L Petrol',
      dimensions: '4615 x 1865 x 1690 mm'
    },
    features: ['4WD', '越野模式', '通風座椅']
  },
  {
    id: '3',
    brand: Brand.TOYOTA,
    model: 'Camry',
    trim: '2.5 Hybrid 旗艦',
    price: 1285000,
    type: CarType.SEDAN,
    imageUrl: 'https://picsum.photos/id/211/800/600',
    specs: {
      horsepower: 218,
      torque: 221,
      acceleration: 8.1,
      fuelEconomy: 21.3,
      engine: '2.5L Hybrid',
      dimensions: '4885 x 1840 x 1455 mm'
    },
    features: ['TSS 3.0', 'JBL音響', '電動天窗']
  },
  {
    id: '4',
    brand: Brand.HONDA,
    model: 'CR-V',
    trim: 'Prestige',
    price: 1180000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/188/800/600',
    specs: {
      horsepower: 193,
      torque: 243,
      acceleration: 8.9,
      fuelEconomy: 14.7,
      engine: '1.5L Turbo',
      dimensions: '4690 x 1865 x 1680 mm'
    },
    features: ['Honda Sensing', '感應式尾門', '無線充電']
  },
  {
    id: '5',
    brand: Brand.HONDA,
    model: 'Civic',
    trim: 'e:HEV',
    price: 1399000,
    type: CarType.HATCHBACK,
    imageUrl: 'https://picsum.photos/id/299/800/600',
    specs: {
      horsepower: 184,
      torque: 315,
      acceleration: 7.8,
      fuelEconomy: 23.7,
      engine: '2.0L Hybrid',
      dimensions: '4550 x 1800 x 1415 mm'
    },
    features: ['Bose音響', '10具氣囊', '蜂巢式出風口']
  },
  {
    id: '6',
    brand: Brand.HONDA,
    model: 'HR-V',
    trim: 'S版',
    price: 799000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/277/800/600',
    specs: {
      horsepower: 143,
      torque: 173,
      acceleration: 10.2,
      fuelEconomy: 17.8,
      engine: '1.5L Petrol',
      dimensions: '4330 x 1790 x 1590 mm'
    },
    features: ['Ultra Seat', 'Honda Sensing', 'Apple CarPlay']
  },
  {
    id: '7',
    brand: Brand.NISSAN,
    model: 'Kicks',
    trim: 'e-Power 旗艦版',
    price: 815000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/322/800/600',
    specs: {
      horsepower: 129,
      torque: 260,
      acceleration: 9.7,
      fuelEconomy: 23.8,
      engine: 'e-Power',
      dimensions: '4295 x 1760 x 1625 mm'
    },
    features: ['ProPILOT', '360環景', 'Bose音響']
  },
  {
    id: '8',
    brand: Brand.NISSAN,
    model: 'Sentra',
    trim: '尊爵版',
    price: 785000,
    type: CarType.SEDAN,
    imageUrl: 'https://picsum.photos/id/355/800/600',
    specs: {
      horsepower: 131,
      torque: 177,
      acceleration: 10.8,
      fuelEconomy: 16.9,
      engine: '1.6L Petrol',
      dimensions: '4641 x 1815 x 1450 mm'
    },
    features: ['Nissan Intelligent Mobility', 'LED頭燈', '真皮座椅']
  },
  {
    id: '9',
    brand: Brand.NISSAN,
    model: 'X-Trail',
    trim: 'e-Power 旗艦版',
    price: 1519000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/388/800/600',
    specs: {
      horsepower: 213,
      torque: 330,
      acceleration: 7.9,
      fuelEconomy: 18.2,
      engine: 'e-Power',
      dimensions: '4680 x 1840 x 1725 mm'
    },
    features: ['e-4ORCE', 'ProPILOT 2.0', '全景天窗']
  },
  {
    id: '10',
    brand: Brand.MAZDA,
    model: 'CX-5',
    trim: '2.5 旗艦進化版',
    price: 1265000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/411/800/600',
    specs: {
      horsepower: 194,
      torque: 258,
      acceleration: 8.7,
      fuelEconomy: 13.8,
      engine: '2.5L Petrol',
      dimensions: '4575 x 1845 x 1690 mm'
    },
    features: ['i-ACTIVSENSE', 'Bose音響', '電動尾門']
  },
  {
    id: '11',
    brand: Brand.MAZDA,
    model: 'CX-30',
    trim: '2.0 旗艦型',
    price: 1088000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/444/800/600',
    specs: {
      horsepower: 165,
      torque: 213,
      acceleration: 9.3,
      fuelEconomy: 15.4,
      engine: '2.0L Petrol',
      dimensions: '4395 x 1795 x 1540 mm'
    },
    features: ['i-ACTIVSENSE', 'Mazda Connect', 'HUD抬頭顯示器']
  },
  {
    id: '12',
    brand: Brand.FORD,
    model: 'Kuga',
    trim: 'EcoBoost 250 旗艦X',
    price: 1299000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/466/800/600',
    specs: {
      horsepower: 250,
      torque: 389,
      acceleration: 7.5,
      fuelEconomy: 12.6,
      engine: '2.0L Turbo',
      dimensions: '4614 x 1882 x 1677 mm'
    },
    features: ['Co-Pilot360', 'B&O音響', '全景天窗']
  },
  {
    id: '13',
    brand: Brand.FORD,
    model: 'Focus',
    trim: 'EcoBoost 182 運動型',
    price: 959000,
    type: CarType.HATCHBACK,
    imageUrl: 'https://picsum.photos/id/488/800/600',
    specs: {
      horsepower: 182,
      torque: 240,
      acceleration: 8.2,
      fuelEconomy: 15.7,
      engine: '1.5L Turbo',
      dimensions: '4378 x 1825 x 1471 mm'
    },
    features: ['Co-Pilot360', 'B&O音響', 'SYNC 3']
  },
  {
    id: '14',
    brand: Brand.VOLKSWAGEN,
    model: 'T-Roc',
    trim: '330 TSI R-Line',
    price: 928000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/511/800/600',
    specs: {
      horsepower: 190,
      torque: 320,
      acceleration: 7.4,
      fuelEconomy: 14.3,
      engine: '2.0L Turbo',
      dimensions: '4234 x 1819 x 1573 mm'
    },
    features: ['4MOTION', 'DSG雙離合器', 'Digital Cockpit']
  },
  {
    id: '15',
    brand: Brand.VOLKSWAGEN,
    model: 'Tiguan',
    trim: '380 TSI R-Line',
    price: 1798000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/533/800/600',
    specs: {
      horsepower: 245,
      torque: 370,
      acceleration: 6.8,
      fuelEconomy: 12.1,
      engine: '2.0L Turbo',
      dimensions: '4509 x 1859 x 1677 mm'
    },
    features: ['4MOTION', 'IQ.DRIVE', '全景天窗']
  },
  {
    id: '16',
    brand: Brand.VOLKSWAGEN,
    model: 'Golf',
    trim: '280 TSI R-Line',
    price: 1398000,
    type: CarType.HATCHBACK,
    imageUrl: 'https://picsum.photos/id/555/800/600',
    specs: {
      horsepower: 150,
      torque: 250,
      acceleration: 8.4,
      fuelEconomy: 16.2,
      engine: '1.5L Turbo',
      dimensions: '4284 x 1789 x 1456 mm'
    },
    features: ['DSG雙離合器', 'Digital Cockpit', 'IQ.DRIVE']
  },
  {
    id: '17',
    brand: Brand.BMW,
    model: '3 Series',
    trim: '320i M Sport',
    price: 2480000,
    type: CarType.SEDAN,
    imageUrl: 'https://picsum.photos/id/577/800/600',
    specs: {
      horsepower: 184,
      torque: 300,
      acceleration: 7.4,
      fuelEconomy: 15.2,
      engine: '2.0L Turbo',
      dimensions: '4713 x 1827 x 1440 mm'
    },
    features: ['Curved Display', 'HUD', 'Harman Kardon']
  },
  {
    id: '18',
    brand: Brand.MERCEDES,
    model: 'C-Class',
    trim: 'C 200 Avantgarde',
    price: 2520000,
    type: CarType.SEDAN,
    imageUrl: 'https://picsum.photos/id/599/800/600',
    specs: {
      horsepower: 204,
      torque: 300,
      acceleration: 7.3,
      fuelEconomy: 14.9,
      engine: '2.0L Turbo',
      dimensions: '4751 x 1820 x 1438 mm'
    },
    features: ['MBUX', 'Burmester音響', 'DISTRONIC']
  },
  {
    id: '19',
    brand: Brand.MERCEDES,
    model: 'GLC',
    trim: 'GLC 300 4MATIC',
    price: 3180000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/611/800/600',
    specs: {
      horsepower: 258,
      torque: 400,
      acceleration: 6.2,
      fuelEconomy: 11.8,
      engine: '2.0L Turbo',
      dimensions: '4716 x 1890 x 1640 mm'
    },
    features: ['4MATIC', 'MBUX', 'AIR BODY CONTROL']
  },
  {
    id: '20',
    brand: Brand.MITSUBISHI,
    model: 'XForce',
    trim: '狂享版',
    price: 842000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/633/800/600',
    specs: {
      horsepower: 139,
      torque: 178,
      acceleration: 10.5,
      fuelEconomy: 16.5,
      engine: '1.5L Turbo',
      dimensions: '4390 x 1810 x 1660 mm'
    },
    features: ['Level 2駕駛輔助', 'Yamaha音響', '12.3吋觸控螢幕']
  },
  {
    id: '21',
    brand: Brand.LEXUS,
    model: 'ES',
    trim: 'ES 250 豪華版',
    price: 2070000,
    type: CarType.SEDAN,
    imageUrl: 'https://picsum.photos/id/655/800/600',
    specs: {
      horsepower: 207,
      torque: 243,
      acceleration: 8.9,
      fuelEconomy: 13.4,
      engine: '2.5L Petrol',
      dimensions: '4975 x 1865 x 1445 mm'
    },
    features: ['LSS+ 3.0', 'Mark Levinson', '電動天窗']
  },
  {
    id: '22',
    brand: Brand.LEXUS,
    model: 'NX',
    trim: 'NX 250 F Sport',
    price: 2100000,
    type: CarType.SUV,
    imageUrl: 'https://picsum.photos/id/677/800/600',
    specs: {
      horsepower: 203,
      torque: 241,
      acceleration: 8.7,
      fuelEconomy: 12.9,
      engine: '2.5L Petrol',
      dimensions: '4660 x 1865 x 1660 mm'
    },
    features: ['LSS+ 3.0', '全景天窗', 'Mark Levinson']
  },
  {
    id: '23',
    brand: Brand.TESLA,
    model: 'Model Y',
    trim: 'Long Range',
    price: 2120000,
    type: CarType.EV,
    imageUrl: 'https://picsum.photos/id/234/800/600',
    specs: {
      horsepower: 384,
      torque: 510,
      acceleration: 5.0,
      fuelEconomy: 542, // range
      engine: 'Dual Motor',
      dimensions: '4751 x 1921 x 1624 mm'
    },
    features: ['Autopilot', 'Glass Roof', 'Supercharging']
  },
  {
    id: '24',
    brand: Brand.PORSCHE,
    model: '911',
    trim: 'Carrera',
    price: 7040000,
    type: CarType.COUPE,
    imageUrl: 'https://picsum.photos/id/699/800/600',
    specs: {
      horsepower: 385,
      torque: 450,
      acceleration: 4.2,
      fuelEconomy: 9.8,
      engine: '3.0L Twin-Turbo',
      dimensions: '4519 x 1852 x 1298 mm'
    },
    features: ['PDK', 'Sport Chrono', 'Wet Mode']
  }
];

export const INITIAL_FILTER_STATE: import('./types').FilterState = {
  minPrice: 0,
  maxPrice: 8000000,
  brand: 'All',
  type: 'All',
  keyword: '',
};
