
export interface SiteSettings {
  id: string;
  site_name: string;
  admin_email: string;
  timezone: string;
  maintenance_mode: boolean;
}

export interface PasswordConfirmData {
  password?: string;
}

export interface BrandingSettings {
  id: string;
  company_name: string;
  tagline: string;
  youtube_channel: string;
  instagram_handle: string;
  tiktok_handle: string;
  twitter_handle: string;
  facebook_page: string;
  website_url: string;
  created_at?: string;
  updated_at?: string;
}
