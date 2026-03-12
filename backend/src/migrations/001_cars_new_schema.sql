-- Migration 001: Rebuild cars table for CarAPI schema
-- Drops old cars table and dependent tables, recreates with new column layout

DROP TABLE IF EXISTS comparison_items;
DROP TABLE IF EXISTS comparison_lists;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS cars;

CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(50),
  year INTEGER,
  make VARCHAR(100),
  model VARCHAR(100),
  trim VARCHAR(200),
  body_type VARCHAR(50),
  fuel_type VARCHAR(50),
  transmission VARCHAR(50),
  engine VARCHAR(200),
  horsepower INTEGER,
  msrp INTEGER,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_make ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars(year);
CREATE INDEX IF NOT EXISTS idx_cars_body_type ON cars(body_type);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_msrp ON cars(msrp);

-- Recreate dependent tables
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, car_id)
);

CREATE TABLE comparison_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'My Comparison',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comparison_items (
  id SERIAL PRIMARY KEY,
  comparison_list_id INTEGER NOT NULL REFERENCES comparison_lists(id) ON DELETE CASCADE,
  car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comparison_list_id, car_id)
);
