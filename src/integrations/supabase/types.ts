export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      filiais: {
        Row: {
          ativo: boolean
          created_at: string
          endereco_entrega: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          endereco_entrega: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          endereco_entrega?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      image_annotations: {
        Row: {
          annotation_data: Json
          created_at: string | null
          created_by: string | null
          id: string
          image_id: string | null
          updated_at: string | null
        }
        Insert: {
          annotation_data: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_id?: string | null
          updated_at?: string | null
        }
        Update: {
          annotation_data?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "image_annotations_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "order_images"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_order_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_order_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_order_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_order_id_fkey"
            columns: ["related_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_images: {
        Row: {
          annotations: Json | null
          created_at: string
          id: string
          image_url: string
          order_id: string
        }
        Insert: {
          annotations?: Json | null
          created_at?: string
          id?: string
          image_url: string
          order_id: string
        }
        Update: {
          annotations?: Json | null
          created_at?: string
          id?: string
          image_url?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_images_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          material: string | null
          observations: string | null
          order_id: string
          product_name: string
          prosthesis_type: string
          quantity: number
          selected_teeth: string[]
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          material?: string | null
          observations?: string | null
          order_id: string
          product_name: string
          prosthesis_type: string
          quantity?: number
          selected_teeth?: string[]
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          material?: string | null
          observations?: string | null
          order_id?: string
          product_name?: string
          prosthesis_type?: string
          quantity?: number
          selected_teeth?: string[]
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_public: boolean | null
          name: string
          prosthesis_type: string
          specifications: Json
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          prosthesis_type: string
          specifications: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          prosthesis_type?: string
          specifications?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          color: string | null
          created_at: string
          deadline: string
          delivery_address: string | null
          dentist: string
          id: string
          material: string | null
          observations: string | null
          patient_id: string
          priority: string
          prosthesis_type: string
          selected_teeth: string[]
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          deadline: string
          delivery_address?: string | null
          dentist: string
          id?: string
          material?: string | null
          observations?: string | null
          patient_id: string
          priority: string
          prosthesis_type: string
          selected_teeth?: string[]
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          deadline?: string
          delivery_address?: string | null
          dentist?: string
          id?: string
          material?: string | null
          observations?: string | null
          patient_id?: string
          priority?: string
          prosthesis_type?: string
          selected_teeth?: string[]
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          cpf: string
          created_at: string
          dentist_id: string | null
          email: string
          id: string
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          cpf: string
          created_at?: string
          dentist_id?: string | null
          email: string
          id?: string
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          cpf?: string
          created_at?: string
          dentist_id?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      production_queue: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          estimated_completion: string | null
          id: string
          order_id: string | null
          position: number
          priority: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          estimated_completion?: string | null
          id?: string
          order_id?: string | null
          position: number
          priority?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          estimated_completion?: string | null
          id?: string
          order_id?: string | null
          position?: number
          priority?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      production_stages: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string | null
          stage_name: string
          stage_order: number
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          stage_name: string
          stage_order: number
          started_at?: string | null
          status: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          stage_name?: string
          stage_order?: number
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_stages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ativo: boolean
          categoria: string
          codigo: string
          created_at: string
          id: string
          material: string
          necessita_cor: boolean
          necessita_implante: boolean
          nome_produto: string
          subcategoria: string
          tipo_resina: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria: string
          codigo: string
          created_at?: string
          id?: string
          material: string
          necessita_cor?: boolean
          necessita_implante?: boolean
          nome_produto: string
          subcategoria: string
          tipo_resina?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria?: string
          codigo?: string
          created_at?: string
          id?: string
          material?: string
          necessita_cor?: boolean
          necessita_implante?: boolean
          nome_produto?: string
          subcategoria?: string
          tipo_resina?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      support_chat_messages: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          message: string
          read_by_admin: boolean | null
          read_by_dentist: boolean | null
          sender_type: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          message: string
          read_by_admin?: boolean | null
          read_by_dentist?: boolean | null
          sender_type: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read_by_admin?: boolean | null
          read_by_dentist?: boolean | null
          sender_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      support_conversations: {
        Row: {
          created_at: string
          dentist_id: string
          dentist_name: string
          id: string
          last_message_at: string
          status: string
          unread_by_admin: number | null
          unread_by_dentist: number | null
        }
        Insert: {
          created_at?: string
          dentist_id: string
          dentist_name: string
          id?: string
          last_message_at?: string
          status?: string
          unread_by_admin?: number | null
          unread_by_dentist?: number | null
        }
        Update: {
          created_at?: string
          dentist_id?: string
          dentist_name?: string
          id?: string
          last_message_at?: string
          status?: string
          unread_by_admin?: number | null
          unread_by_dentist?: number | null
        }
        Relationships: []
      }
      support_typing_indicators: {
        Row: {
          conversation_id: string
          id: string
          is_typing: boolean
          last_activity: string
          user_id: string
          user_name: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_typing?: boolean
          last_activity?: string
          user_id: string
          user_name: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_typing?: boolean
          last_activity?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_typing_indicators_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          dashboard_layout: Json | null
          email_notifications: boolean | null
          language: string | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_layout?: Json | null
          email_notifications?: boolean | null
          language?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_layout?: Json | null
          email_notifications?: boolean | null
          language?: string | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      order_analytics: {
        Row: {
          avg_completion_hours: number | null
          completed_orders: number | null
          date: string | null
          in_production: number | null
          pending_orders: number | null
          total_orders: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_typing_indicators: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_title: string
          p_message: string
          p_type: string
          p_related_order_id?: string
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_or_create_conversation: {
        Args: { p_dentist_id: string; p_dentist_name: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      update_queue_positions: {
        Args: { p_positions: Json }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "dentist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "dentist"],
    },
  },
} as const
