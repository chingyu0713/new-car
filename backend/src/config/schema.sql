-- AutoSpec Database Schema (FuelEconomy.gov)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars table (FuelEconomy.gov schema)
CREATE TABLE IF NOT EXISTS cars (
  id                  SERIAL PRIMARY KEY,
  fuel_economy_id     INTEGER UNIQUE NOT NULL,
  make                VARCHAR(100) NOT NULL,
  model               VARCHAR(200) NOT NULL,
  year                INTEGER NOT NULL,
  trim_desc           VARCHAR(500),
  fuel_type           VARCHAR(100),
  fuel_type_zh        VARCHAR(100),
  drive               VARCHAR(100),
  drive_zh            VARCHAR(100),
  transmission        VARCHAR(200),
  transmission_zh     VARCHAR(200),
  cylinders           INTEGER,
  displacement        DECIMAL(4,1),
  vehicle_class       VARCHAR(100),
  vehicle_class_zh    VARCHAR(100),
  city_mpg            INTEGER,
  highway_mpg         INTEGER,
  combined_mpg        INTEGER,
  city_mpg_e          INTEGER,
  highway_mpg_e       INTEGER,
  combined_mpg_e      INTEGER,
  range_city          INTEGER,
  range_highway       INTEGER,
  co2                 INTEGER,
  make_zh             VARCHAR(100),
  image_url           TEXT,
  image_url_banner    TEXT,
  image_url_detail    TEXT,
  cached_at           TIMESTAMP DEFAULT NOW()
);

-- Car images table (multiple images per car, 3 slots)
CREATE TABLE IF NOT EXISTS car_images (
  id         SERIAL PRIMARY KEY,
  car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  slot       VARCHAR(20) NOT NULL DEFAULT 'main',  -- 'main', 'banner', 'detail'
  url        TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
CREATE INDEX IF NOT EXISTS idx_car_images_slot   ON car_images(car_id, slot, sort_order);

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cars_make     ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_year     ON cars(year DESC);
CREATE INDEX IF NOT EXISTS idx_cars_class    ON cars(vehicle_class);
CREATE INDEX IF NOT EXISTS idx_cars_fuel     ON cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_drive    ON cars(drive);
CREATE INDEX IF NOT EXISTS idx_cars_feid     ON cars(fuel_economy_id);
CREATE INDEX IF NOT EXISTS idx_cars_combined ON cars(combined_mpg DESC NULLS LAST);
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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comparison_lists_updated_at') THEN
    CREATE TRIGGER update_comparison_lists_updated_at BEFORE UPDATE ON comparison_lists
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
