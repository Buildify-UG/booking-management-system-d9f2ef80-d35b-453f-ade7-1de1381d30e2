CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accountant', 'booking_officer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  to_city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  booking_date DATE NOT NULL,
  trip_date DATE NOT NULL,
  from_city_id UUID NOT NULL REFERENCES cities(id),
  to_city_id UUID NOT NULL REFERENCES cities(id),
  ticket_price DECIMAL(10, 2) NOT NULL,
  num_tickets INTEGER NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  booking_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES app_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance DECIMAL(12, 2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'debit')),
  amount DECIMAL(10, 2) NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES app_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);