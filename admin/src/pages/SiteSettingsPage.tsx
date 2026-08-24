import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Car, Bus, Package, Compass, Save } from "lucide-react";

interface SiteSettings {
  showPrivateTransfers: boolean;
  showVanCoach: boolean;
  showPackages: boolean;
  showSightseeing: boolean;
}

const SERVICES: { key: keyof SiteSettings; label: string; description: string; icon: typeof Car }[] = [
  { key: "showPrivateTransfers", label: "Private Transfers", description: "Show the Private Transfers card on the homepage", icon: Car },
  { key: "showVanCoach", label: "Van & Coach", description: "Show the Van & Coach card on the homepage", icon: Bus },
  { key: "showPackages", label: "Packages", description: "Show the Packages card on the homepage", icon: Package },
  { key: "showSightseeing", label: "Sightseeing", description: "Show the Sightseeing card on the homepage", icon: Compass },
];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<SiteSettings>("/site-settings");
      setSettings(data);
    } catch {
      toast.error("Failed to load site settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (key: keyof SiteSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await api.put<SiteSettings>("/site-settings", settings);
      setSettings(updated);
      toast.success("Homepage settings updated");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Homepage Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control which service cards appear on the homepage</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading || !settings ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
          ) : (
            SERVICES.map(({ key, label, description, icon: Icon }) => (
              <label
                key={key}
                className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                  settings[key] ? "border-primary bg-primary/5" : ""
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${settings[key] ? "bg-[#1B2A4A] text-[#C9A227]" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className={`flex h-6 w-11 items-center rounded-full transition-colors ${settings[key] ? "bg-[#1B2A4A]" : "bg-gray-300"}`}>
                  <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${settings[key] ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={() => toggle(key)}
                  className="sr-only"
                />
              </label>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
