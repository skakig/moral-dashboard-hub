
export interface SiteSettings {
  id: string;
  site_name: string;
  admin_email: string;
  timezone: string;
  maintenance_mode: boolean;
}

export interface PasswordConfirmData {
  password: string;
}
