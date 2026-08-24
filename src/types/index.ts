export interface User {
  id: string;
  username: string;
  role: 'admin' | 'accountant' | 'booking_officer';
  is_active: boolean;
}

export interface City {
  id: string;
  name: string;
}

export interface Route {
  id: string;
  from_city_id: string;
  to_city_id: string;
  price: number;
}

export interface Booking {
  id: string;
  booking_code: string;
  booking_date: string;
  trip_date: string;
  from_city_id: string;
  to_city_id: string;
  ticket_price: number;
  num_tickets: number;
  total_amount: number;
  commission_amount: number;
  net_amount: number;
  booking_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface AccountTransaction {
  id: string;
  transaction_type: 'deposit' | 'debit';
  amount: number;
  booking_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}
