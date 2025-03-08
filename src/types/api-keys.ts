
export interface ApiKey {
  id: string;
  service_name: string;
  is_active: boolean;
  last_validated: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiKeyStatus {
  serviceName: string;
  isConfigured: boolean;
  isActive: boolean;
  lastValidated: string | null;
}

export interface ApiKeyValidationRequest {
  serviceName: string;
  apiKey: string;
}

export interface ApiKeyValidationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ApiKeysStatusResponse {
  success: boolean;
  data?: ApiKeyStatus[];
  error?: string;
}
