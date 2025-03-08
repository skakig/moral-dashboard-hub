
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

/**
 * Data structure for API key information
 */
export interface ApiKeyData {
  serviceName: string;
  category: string;
  apiKey: string;
  baseUrl?: string;
  isPrimary?: boolean;
}

/**
 * Database operation result
 */
export interface DbOperationResult {
  success?: boolean;
  data?: any;
  error?: any;
  warning?: string;
}

/**
 * Represents an API key record
 */
export interface ApiKeyRecord {
  id: string;
  service_name: string;
  category: string;
  api_key: string;
  base_url?: string;
  is_primary?: boolean;
  status?: string;
  last_validated?: string;
  is_active?: boolean;
}
