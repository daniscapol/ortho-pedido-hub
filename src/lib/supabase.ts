import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          name: string
          cpf: string
          phone: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cpf: string
          phone: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cpf?: string
          phone?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          patient_id: string
          dentist: string
          prosthesis_type: string
          material: string
          color: string
          priority: string
          deadline: string
          observations: string
          delivery_address: string
          selected_teeth: string[]
          status: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          patient_id: string
          dentist: string
          prosthesis_type: string
          material?: string
          color?: string
          priority: string
          deadline: string
          observations?: string
          delivery_address?: string
          selected_teeth: string[]
          status?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          patient_id?: string
          dentist?: string
          prosthesis_type?: string
          material?: string
          color?: string
          priority?: string
          deadline?: string
          observations?: string
          delivery_address?: string
          selected_teeth?: string[]
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      order_images: {
        Row: {
          id: string
          order_id: string
          image_url: string
          annotations: any
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          image_url: string
          annotations?: any
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          image_url?: string
          annotations?: any
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          order_id: string
          user_id: string
          message: string
          sender_type: 'dentist' | 'lab'
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          message: string
          sender_type: 'dentist' | 'lab'
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          message?: string
          sender_type?: 'dentist' | 'lab'
          created_at?: string
        }
      }
    }
  }
}