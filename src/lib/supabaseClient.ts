import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para as tabelas do banco
export interface User {
  id: string
  email: string
  whatsapp_number: string
  username: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  user_id: string
  title: string
  description: string
  image_url: string
  price: number
  created_at: string
} 