export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      feedback: {
        Row: {
          app_version: string
          category: string | null
          created_at: string | null
          device_platform: string | null
          email: string | null
          id: string
          message: string
          project: string
          status: string
        }
        Insert: {
          app_version: string
          category?: string | null
          created_at?: string | null
          device_platform?: string | null
          email?: string | null
          id?: string
          message: string
          project?: string
          status?: string
        }
        Update: {
          app_version?: string
          category?: string | null
          created_at?: string | null
          device_platform?: string | null
          email?: string | null
          id?: string
          message?: string
          project?: string
          status?: string
        }
        Relationships: []
      }
      feature_surveys: {
        Row: {
          app_version: string | null
          created_at: string
          currency: string | null
          device_platform: string | null
          email: string | null
          id: string
          project: string | null
          response: Json
          survey_key: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          currency?: string | null
          device_platform?: string | null
          email?: string | null
          id?: string
          project?: string | null
          response?: Json
          survey_key: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          currency?: string | null
          device_platform?: string | null
          email?: string | null
          id?: string
          project?: string | null
          response?: Json
          survey_key?: string
        }
        Relationships: []
      }
      newsletter_sends: {
        Row: {
          id: string
          project: string
          recipients_count: number
          sent_at: string | null
          subject: string
          template_id: string | null
        }
        Insert: {
          id?: string
          project: string
          recipients_count: number
          sent_at?: string | null
          subject: string
          template_id?: string | null
        }
        Update: {
          id?: string
          project?: string
          recipients_count?: number
          sent_at?: string | null
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_sends_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "newsletter_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          newsletter_approval: boolean
          project: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          newsletter_approval?: boolean
          project: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          newsletter_approval?: boolean
          project?: string
        }
        Relationships: []
      }
      newsletter_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          name: string
          project: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          name: string
          project: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          name?: string
          project?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
