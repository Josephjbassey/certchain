export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certificate_cache: {
        Row: {
          certificate_id: string
          course_name: string
          created_at: string | null
          expires_at: string | null
          hedera_tx_id: string | null
          id: string
          ipfs_cid: string
          issued_at: string
          issuer_did: string
          last_synced_at: string | null
          metadata: Json | null
          recipient_account_id: string | null
          recipient_did: string | null
          recipient_email: string | null
          revoked_at: string | null
          serial_number: number
          token_id: string
        }
        Insert: {
          certificate_id: string
          course_name: string
          created_at?: string | null
          expires_at?: string | null
          hedera_tx_id?: string | null
          id?: string
          ipfs_cid: string
          issued_at: string
          issuer_did: string
          last_synced_at?: string | null
          metadata?: Json | null
          recipient_account_id?: string | null
          recipient_did?: string | null
          recipient_email?: string | null
          revoked_at?: string | null
          serial_number: number
          token_id: string
        }
        Update: {
          certificate_id?: string
          course_name?: string
          created_at?: string | null
          expires_at?: string | null
          hedera_tx_id?: string | null
          id?: string
          ipfs_cid?: string
          issued_at?: string
          issuer_did?: string
          last_synced_at?: string | null
          metadata?: Json | null
          recipient_account_id?: string | null
          recipient_did?: string | null
          recipient_email?: string | null
          revoked_at?: string | null
          serial_number?: number
          token_id?: string
        }
        Relationships: []
      }
      claim_tokens: {
        Row: {
          certificate_id: string
          claimed_at: string | null
          claimed_by: string | null
          created_at: string | null
          expires_at: string
          id: string
          issued_by: string
          nonce: string | null
          token: string
        }
        Insert: {
          certificate_id: string
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          issued_by: string
          nonce?: string | null
          token: string
        }
        Update: {
          certificate_id?: string
          claimed_at?: string | null
          claimed_by?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          issued_by?: string
          nonce?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_tokens_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificate_cache"
            referencedColumns: ["certificate_id"]
          },
        ]
      }
      hcs_events: {
        Row: {
          consensus_timestamp: string
          created_at: string | null
          id: string
          message_type: string
          payload: Json | null
          processed: boolean | null
          sequence_number: number
          topic_id: string
        }
        Insert: {
          consensus_timestamp: string
          created_at?: string | null
          id?: string
          message_type: string
          payload?: Json | null
          processed?: boolean | null
          sequence_number: number
          topic_id: string
        }
        Update: {
          consensus_timestamp?: string
          created_at?: string | null
          id?: string
          message_type?: string
          payload?: Json | null
          processed?: boolean | null
          sequence_number?: number
          topic_id?: string
        }
        Relationships: []
      }
      institutions: {
        Row: {
          collection_token_id: string | null
          created_at: string | null
          did: string
          domain: string | null
          hcs_topic_id: string | null
          hedera_account_id: string
          id: string
          logo_url: string | null
          name: string
          treasury_account_id: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          collection_token_id?: string | null
          created_at?: string | null
          did: string
          domain?: string | null
          hcs_topic_id?: string | null
          hedera_account_id: string
          id?: string
          logo_url?: string | null
          name: string
          treasury_account_id?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          collection_token_id?: string | null
          created_at?: string | null
          did?: string
          domain?: string | null
          hcs_topic_id?: string | null
          hedera_account_id?: string
          id?: string
          logo_url?: string | null
          name?: string
          treasury_account_id?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          did: string | null
          display_name: string | null
          email: string | null
          hedera_account_id: string | null
          id: string
          institution_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          did?: string | null
          display_name?: string | null
          email?: string | null
          hedera_account_id?: string | null
          id: string
          institution_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          did?: string | null
          display_name?: string | null
          email?: string | null
          hedera_account_id?: string | null
          id?: string
          institution_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          active: boolean | null
          created_at: string | null
          events: string[]
          id: string
          institution_id: string | null
          secret: string
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          events: string[]
          id?: string
          institution_id?: string | null
          secret: string
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          events?: string[]
          id?: string
          institution_id?: string | null
          secret?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "issuer" | "user"
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
      app_role: ["admin", "issuer", "user"],
    },
  },
} as const
