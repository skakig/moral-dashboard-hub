
import { SiteSettings } from "@/types/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SettingsFormProps {
  settings: SiteSettings;
  originalEmail: string;
  error: string | null;
  saving: boolean;
  onChange: (settings: SiteSettings) => void;
  onSave: () => void;
}

export function SettingsForm({
  settings,
  originalEmail,
  error,
  saving,
  onChange,
  onSave
}: SettingsFormProps) {
  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="site-name">Site Name</Label>
        <Input 
          id="site-name" 
          value={settings.site_name} 
          onChange={(e) => onChange({...settings, site_name: e.target.value})}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="admin-email">Admin Email</Label>
        <Input 
          id="admin-email" 
          type="email"
          value={settings.admin_email} 
          onChange={(e) => onChange({...settings, admin_email: e.target.value})}
        />
        {settings.admin_email !== originalEmail && (
          <p className="text-sm text-amber-500 mt-1">
            Changing admin email will require password confirmation for security.
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select 
          value={settings.timezone}
          onValueChange={(value) => onChange({...settings, timezone: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="utc">UTC</SelectItem>
            <SelectItem value="est">Eastern Time (EST)</SelectItem>
            <SelectItem value="pst">Pacific Time (PST)</SelectItem>
            <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
          <p className="text-sm text-muted-foreground">
            Put the site in maintenance mode
          </p>
        </div>
        <Switch 
          id="maintenance-mode" 
          checked={settings.maintenance_mode}
          onCheckedChange={(checked) => onChange({...settings, maintenance_mode: checked})}
        />
      </div>
      
      <div className="mt-4">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </>
  );
}
