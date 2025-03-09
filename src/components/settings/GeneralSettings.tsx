
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { PasswordConfirmDialog } from "@/components/settings/PasswordConfirmDialog";

export function GeneralSettings() {
  const {
    settings,
    setSettings,
    loading,
    saving,
    error,
    originalEmail,
    showPasswordConfirm,
    setShowPasswordConfirm,
    handleSave,
    saveSettings
  } = useGeneralSettings();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Manage system-wide settings for TMH
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsForm
            settings={settings}
            originalEmail={originalEmail}
            error={error}
            saving={saving}
            onChange={setSettings}
            onSave={handleSave}
          />
        </CardContent>
      </Card>

      <PasswordConfirmDialog
        open={showPasswordConfirm}
        onOpenChange={setShowPasswordConfirm}
        onCancel={() => {
          setSettings(prev => ({...prev, admin_email: originalEmail}));
        }}
        onConfirm={saveSettings}
        saving={saving}
      />
    </>
  );
}
