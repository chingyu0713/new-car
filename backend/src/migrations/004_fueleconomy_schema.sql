-- Migration 004: FuelEconomy.gov schema
-- Drops all dependent tables first, rebuilds with FuelEconomy.gov structure

DROP TABLE IF EXISTS comparison_items;
DROP TABLE IF EXISTS comparison_lists;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS cars;

CREATE TABLE cars (
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

CREATE INDEX idx_cars_make     ON cars(make);
CREATE INDEX idx_cars_year     ON cars(year DESC);
CREATE INDEX idx_cars_class    ON cars(vehicle_class);
CREATE INDEX idx_cars_fuel     ON cars(fuel_type);
CREATE INDEX idx_cars_drive    ON cars(drive);
CREATE INDEX idx_cars_feid     ON cars(fuel_economy_id);
CREATE INDEX idx_cars_combined ON cars(combined_mpg DESC NULLS LAST);

-- Recreate dependent tables (users must already exist)
CREATE TABLE favorites (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id     INTEGER NOT NULL REFERENCES cars(id)  ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, car_id)
);

CREATE TABLE comparison_lists (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(255) DEFAULT 'My Comparison',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comparison_items (
  id                 SERIAL PRIMARY KEY,
  comparison_list_id INTEGER NOT NULL REFERENCES comparison_lists(id) ON DELETE CASCADE,
  car_id             INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  added_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comparison_list_id, car_id)
);
