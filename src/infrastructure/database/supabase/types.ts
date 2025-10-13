/**
 * Database Types
 *
 * Supabase database schema'sının TypeScript type definitions.
 * Bu dosya database schema değiştikçe güncellenmeli.
 *
 * Auto-generate için: `supabase gen types typescript --project-id YOUR_PROJECT_ID`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          company_name: string;
          domain: string | null;
          subscription_plan: string | null;
          subscription_status: string;
          n8n_webhook_url: string | null;
          odoo_api_config: Json | null;
          shopify_store_config: Json | null;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          domain?: string | null;
          subscription_plan?: string | null;
          subscription_status?: string;
          n8n_webhook_url?: string | null;
          odoo_api_config?: Json | null;
          shopify_store_config?: Json | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          domain?: string | null;
          subscription_plan?: string | null;
          subscription_status?: string;
          n8n_webhook_url?: string | null;
          odoo_api_config?: Json | null;
          shopify_store_config?: Json | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          tenant_id: string | null;
          email: string;
          role: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string; // References auth.users
          tenant_id?: string | null;
          email: string;
          role?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          email?: string;
          role?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          tenant_id: string;
          sku: string;
          title: string;
          description: string | null;
          price: number;
          cost: number | null;
          stock_quantity: number;
          odoo_product_id: string | null;
          shopify_product_id: string | null;
          images: Json | null;
          attributes: Json | null;
          status: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          sku: string;
          title: string;
          description?: string | null;
          price: number;
          cost?: number | null;
          stock_quantity?: number;
          odoo_product_id?: string | null;
          shopify_product_id?: string | null;
          images?: Json | null;
          attributes?: Json | null;
          status?: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          sku?: string;
          title?: string;
          description?: string | null;
          price?: number;
          cost?: number | null;
          stock_quantity?: number;
          odoo_product_id?: string | null;
          shopify_product_id?: string | null;
          images?: Json | null;
          attributes?: Json | null;
          status?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_connections: {
        Row: {
          id: string;
          tenant_id: string;
          marketplace_type: string;
          credentials: Json;
          status: string;
          last_sync_at: string | null;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          marketplace_type: string;
          credentials: Json;
          status?: string;
          last_sync_at?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          marketplace_type?: string;
          credentials?: Json;
          status?: string;
          last_sync_at?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketplace_listings: {
        Row: {
          id: string;
          product_id: string;
          marketplace_connection_id: string;
          external_product_id: string | null;
          status: string;
          price_override: number | null;
          stock_override: number | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          marketplace_connection_id: string;
          external_product_id?: string | null;
          status?: string;
          price_override?: number | null;
          stock_override?: number | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          marketplace_connection_id?: string;
          external_product_id?: string | null;
          status?: string;
          price_override?: number | null;
          stock_override?: number | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          tenant_id: string;
          marketplace_connection_id: string | null;
          external_order_id: string | null;
          order_number: string;
          customer_info: Json;
          items: Json;
          total_amount: number;
          status: string;
          odoo_sale_order_id: string | null;
          n8n_workflow_triggered: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          marketplace_connection_id?: string | null;
          external_order_id?: string | null;
          order_number: string;
          customer_info: Json;
          items: Json;
          total_amount: number;
          status?: string;
          odoo_sale_order_id?: string | null;
          n8n_workflow_triggered?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          marketplace_connection_id?: string | null;
          external_order_id?: string | null;
          order_number?: string;
          customer_info?: Json;
          items?: Json;
          total_amount?: number;
          status?: string;
          odoo_sale_order_id?: string | null;
          n8n_workflow_triggered?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      n8n_workflows: {
        Row: {
          id: string;
          tenant_id: string | null;
          workflow_name: string;
          n8n_workflow_id: string;
          webhook_url: string;
          trigger_event: string;
          is_active: boolean;
          config: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id?: string | null;
          workflow_name: string;
          n8n_workflow_id: string;
          webhook_url: string;
          trigger_event: string;
          is_active?: boolean;
          config?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string | null;
          workflow_name?: string;
          n8n_workflow_id?: string;
          webhook_url?: string;
          trigger_event?: string;
          is_active?: boolean;
          config?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      automation_logs: {
        Row: {
          id: string;
          tenant_id: string;
          workflow_id: string;
          trigger_event: string;
          status: string;
          payload: Json | null;
          response: Json | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          workflow_id: string;
          trigger_event: string;
          status: string;
          payload?: Json | null;
          response?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          workflow_id?: string;
          trigger_event?: string;
          status?: string;
          payload?: Json | null;
          response?: Json | null;
          error_message?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
