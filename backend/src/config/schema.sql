-- AutoSpec Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,

  -- Specs (JSON column for flexibility)
  engine VARCHAR(100),
  horsepower INTEGER,
  torque INTEGER,
  acceleration DECIMAL(4,2),
  top_speed INTEGER,
  fuel_efficiency DECIMAL(4,2),
  transmission VARCHAR(50),
  drivetrain VARCHAR(50),
  seating_capacity INTEGER,
  cargo_space INTEGER,
  length INTEGER,
  width INTEGER,
  height INTEGER,
  weight INTEGER,

  -- Features (stored as JSON array)
  features JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table (user favorite cars)
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, car_id)
);

-- Comparison lists table
CREATE TABLE IF NOT EXISTS comparison_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'My Comparison',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comparison items (many-to-many between comparison lists and cars)
CREATE TABLE IF NOT EXISTS comparison_items (
  id SERIAL PRIMARY KEY,
  comparison_list_id INTEGER NOT NULL REFERENCES comparison_lists(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comparison_list_id, car_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_type ON cars(type);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_comparison_items_list_id ON comparison_items(comparison_list_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comparison_lists_updated_at BEFORE UPDATE ON comparison_lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
