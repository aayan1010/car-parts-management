import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CarPart {
  id: string;
  part_type: 'dash_kit' | 'wiring_harness' | 'headlight';
  car_brand: string;
  car_model: string;
  car_year: number;
  stock_number: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}
