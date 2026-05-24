-- LapMarket: services marketplace (hybrid with NextAuth user ids)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles linked to Prisma User.id (text cuid)
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('client', 'specialist', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS specialist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('vet', 'groomer')),
  about TEXT,
  address TEXT NOT NULL,
  license_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specialist_verification
  ON specialist_profiles(verification_status);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES specialist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  price INT NOT NULL CHECK (price >= 0),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_services_specialist ON services(specialist_id);

CREATE TABLE IF NOT EXISTS availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_id UUID NOT NULL REFERENCES specialist_profiles(id) ON DELETE CASCADE,
  weekday INT NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME
);

CREATE INDEX IF NOT EXISTS idx_availability_specialist
  ON availability_rules(specialist_id);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES specialist_profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  appointment_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  note TEXT,
  pet_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_specialist_time
  ON appointments(specialist_id, appointment_time);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Public read: approved specialists
CREATE POLICY specialist_profiles_public_read ON specialist_profiles
  FOR SELECT USING (verification_status = 'approved');

CREATE POLICY services_public_read ON services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM specialist_profiles sp
      WHERE sp.id = services.specialist_id
        AND sp.verification_status = 'approved'
    )
  );

CREATE POLICY availability_public_read ON availability_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM specialist_profiles sp
      WHERE sp.id = availability_rules.specialist_id
        AND sp.verification_status = 'approved'
    )
  );

-- Writes via service role from Next.js (no anon write policies)

-- Storage bucket for licenses (run in Dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('licenses', 'licenses', false);
