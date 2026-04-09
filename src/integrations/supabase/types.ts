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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      empresas: {
        Row: {
          codigo_acesso: string
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          codigo_acesso: string
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          codigo_acesso?: string
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string
          empresa_id: string
          id: string
          origem: string
          pedido_id: string | null
          produto_id: string
          quantidade: number
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          empresa_id: string
          id?: string
          origem: string
          pedido_id?: string | null
          produto_id: string
          quantidade: number
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          empresa_id?: string
          id?: string
          origem?: string
          pedido_id?: string | null
          produto_id?: string
          quantidade?: number
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          aprovado_por: string | null
          bairro: string | null
          codigo_poste: string | null
          comments: string | null
          cpf: string | null
          created_at: string
          criado_por: string
          data_aprovacao: string | null
          data_solicitacao: string | null
          empresa_id: string
          id: string
          localizacao: string | null
          observacoes_atendimento: string | null
          observacoes_tecnico: string | null
          rua: string | null
          solicitante: string | null
          status: Database["public"]["Enums"]["order_status"]
          tipo: Database["public"]["Enums"]["order_type"]
          tipo_lampada: string | null
          tipo_servico: string | null
          updated_at: string
        }
        Insert: {
          aprovado_por?: string | null
          bairro?: string | null
          codigo_poste?: string | null
          comments?: string | null
          cpf?: string | null
          created_at?: string
          criado_por: string
          data_aprovacao?: string | null
          data_solicitacao?: string | null
          empresa_id: string
          id?: string
          localizacao?: string | null
          observacoes_atendimento?: string | null
          observacoes_tecnico?: string | null
          rua?: string | null
          solicitante?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tipo?: Database["public"]["Enums"]["order_type"]
          tipo_lampada?: string | null
          tipo_servico?: string | null
          updated_at?: string
        }
        Update: {
          aprovado_por?: string | null
          bairro?: string | null
          codigo_poste?: string | null
          comments?: string | null
          cpf?: string | null
          created_at?: string
          criado_por?: string
          data_aprovacao?: string | null
          data_solicitacao?: string | null
          empresa_id?: string
          id?: string
          localizacao?: string | null
          observacoes_atendimento?: string | null
          observacoes_tecnico?: string | null
          rua?: string | null
          solicitante?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tipo?: Database["public"]["Enums"]["order_type"]
          tipo_lampada?: string | null
          tipo_servico?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          created_at: string
          descricao: string | null
          empresa_id: string
          estoque_minimo: number
          id: string
          nome: string
          quantidade_estoque: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          empresa_id: string
          estoque_minimo?: number
          id?: string
          nome: string
          quantidade_estoque?: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          empresa_id?: string
          estoque_minimo?: number
          id?: string
          nome?: string
          quantidade_estoque?: number
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          empresa_id: string
          id: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name: string
          empresa_id: string
          id?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string
          empresa_id?: string
          id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_empresa_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "funcionario" | "diretor" | "estoque"
      order_status:
        | "rascunho"
        | "aguardando_aprovacao"
        | "aprovado"
        | "rejeitado"
      order_type: "pedido" | "ordem_servico"
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
      app_role: ["funcionario", "diretor", "estoque"],
      order_status: [
        "rascunho",
        "aguardando_aprovacao",
        "aprovado",
        "rejeitado",
      ],
      order_type: ["pedido", "ordem_servico"],
    },
  },
} as const
