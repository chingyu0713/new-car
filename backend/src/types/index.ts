export interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  type: string;
  price: number;
  description?: string;
  image_url?: string;
  specs: CarSpecs;
  features: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CarSpecs {
  engine: string;
  horsepower: number;
  torque: number;
  acceleration: number;
  topSpeed: number;
  fuelEfficiency: number;
  transmission: string;
  drivetrain: string;
  seatingCapacity: number;
  cargoSpace: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

export interface Favorite {
  id: number;
  user_id: number;
  car_id: number;
  created_at: Date;
}

export interface ComparisonList {
  id: number;
  user_id: number;
  name: string;
  cars: Car[];
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: number;
    email: string;
    name: string;
  };
}

export interface AISearchQuery {
  query: string;
  budget?: number;
  brand?: string;
  type?: string;
}

export interface AIRecommendation {
  cars: Car[];
  reasoning: string;
  filters: {
    brand?: string;
    type?: string;
    maxPrice?: number;
    minFuelEfficiency?: number;
  };
}
