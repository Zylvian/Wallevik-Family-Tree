-- Wallevik Family Tree — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birth_year INTEGER NOT NULL,
  death_date TEXT,
  parent_id TEXT REFERENCES people(id) ON DELETE SET NULL
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read people"
  ON people FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert people"
  ON people FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update people"
  ON people FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete people"
  ON people FOR DELETE
  USING (true);

-- Seed data (safe to re-run: skips existing rows)
INSERT INTO people (id, name, birth_year, death_date, parent_id) VALUES
  ('gunnvald-wallevik', 'Gunnvald Wallevik', 1925, NULL, NULL),
  ('stein-gunnar-wallevik', 'Stein Gunnar Wallevik', 1970, NULL, 'gunnvald-wallevik'),
  ('jarle-hjellvik-wallevik', 'Jarle Hjellvik Wallevik', 1998, NULL, 'stein-gunnar-wallevik'),
  ('ingrid-hjellvik-wallevik', 'Ingrid Hjellvik Wallevik', 1999, NULL, 'stein-gunnar-wallevik'),
  ('heidi-wallevik', 'Heidi Wallevik', 1960, NULL, 'gunnvald-wallevik')
ON CONFLICT (id) DO NOTHING;
