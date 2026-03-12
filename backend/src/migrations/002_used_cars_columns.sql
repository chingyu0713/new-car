-- Migration 002: Add used-car fields to cars table
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
