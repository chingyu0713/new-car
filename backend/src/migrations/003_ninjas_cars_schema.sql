-- Migration 003: Replace cars table with API Ninjas schema
-- Drops all dependent tables first, rebuilds with new structure

DROP TABLE IF EXISTS comparison_items;
DROP TABLE IF EXISTS comparison_lists;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS cars;

CREATE TABLE cars (
  id SERIAL PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  cylinders INTEGER,
  displacement DECIMAL(3,1),
  drive VARCHAR(50),          -- fwd / rwd / awd / 4wd
  fuel_type VARCHAR(50),      -- gas / diesel / electricity
  highway_mpg INTEGER,
  city_mpg INTEGER,
  transmission VARCHAR(50),   -- a (automatic) / m (manual)
  class VARCHAR(100),         -- Compact Cars / Midsize SUV 2WD / Pickup Trucks ...
  image_url TEXT,             -- IMAGIN.studio CDN URL
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(make, model, year)
);

CREATE INDEX idx_cars_make  ON cars(make);
CREATE INDEX idx_cars_year  ON cars(year DESC);
CREATE INDEX idx_cars_class ON cars(class);
CREATE INDEX idx_cars_fuel  ON cars(fuel_type);
CREATE INDEX idx_cars_drive ON cars(drive);

-- Recreate dependent tables (users must already exist)
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id  INTEGER NOT NULL REFERENCES cars(id)  ON DELETE CASCADE,
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
