"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Save, Loader2, AlertTriangle, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  { value: "scheduled",  label: "Scheduled Maintenance",   estimate: "~2 hours"   },
  { value: "database",   label: "Database Issue",           estimate: "~1 hour"    },
  { value: "server",     label: "Server Trouble",           estimate: "~1.5 hours" },
  { value: "security",   label: "Security Update",          estimate: "~4 hours"   },
  { value: "deployment", label: "New Deployment",           estimate: "~30 minutes"},
  { value: "emergency",  label: "Emergency (Unknown)",      estimate: "Unknown"    },
  { value: "unknown",    label: "Unknown Issue",            estimate: "Unknown"    },
];

const DEFAULTS = {
  maintenance_mode: "false", maintenance_message: "", maintenance_reason: "scheduled",
  maintenance_estimated_end: "", public_prayer_wall: "true", online_registrations: "true",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [dirty, setDirty]       = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => { setSettings({ ...DEFAULTS, ...d }); setLoading(false); })
      .catch(() => { toast.error("Couldn't load settings."); setLoading(false); });
  }, []);

  function update(key: string, value: string) {
    setSettings(p => ({ ...p, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved. Changes are live.");
      setDirty(false);
    } catch {
      toast.error("Save failed. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  const isOn = settings.maintenance_mode === "true";
  const reasonMeta = REASONS.find(r => r.value === settings.maintenance_reason);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#A92FFA] mx-auto" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">Every save reaches the database — nothing here is fake.</p>
        {dirty && <Badge className="mt-3 bg-[#F28C28]/20 text-[#F28C28] border-[#F28C28]/30">Unsaved changes</Badge>}
      </div>

      <Card className={`border-2 transition-all duration-300 ${isOn ? "border-[#F28C28] bg-[#F28C28]/5" : "border-border"}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F28C28]/10 rounded-lg flex items-center justify-center">
              <WrenchIcon className="w-5 h-5 text-[#F28C28]" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                Maintenance Mode
                {isOn && <Badge className="bg-[#F28C28] text-white text-xs">ACTIVE</Badge>}
              </CardTitle>
              <CardDescription>When active, every visitor sees the maintenance page. Admins see a warning banner.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <p className="font-medium">Enable Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">{isOn ? "Site is currently locked to visitors" : "Site is publicly accessible"}</p>
            </div>
            <Switch checked={isOn} onCheckedChange={v => update("maintenance_mode", v ? "true" : "false")} />
          </div>
          <div className="space-y-2">
            <Label>Reason for Maintenance</Label>
            <Select value={settings.maintenance_reason} onValueChange={v => update("maintenance_reason", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label} <span className="text-xs text-muted-foreground ml-1">({r.estimate})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reasonMeta && (
              <p className="text-xs text-muted-foreground">
                Estimated duration: <span className="text-[#F28C28] font-medium">{reasonMeta.estimate}</span> — auto-sets the countdown timer.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Custom Message <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
            <Textarea placeholder="Leave blank for the default Ucon pastoral message..." value={settings.maintenance_message}
              onChange={e => update("maintenance_message", e.target.value)} rows={3} className="resize-none" />
          </div>
          {isOn && (
            <div className="flex items-start gap-3 p-3 bg-[#F28C28]/10 border border-[#F28C28]/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-[#F28C28] mt-0.5 shrink-0" />
              <p className="text-sm text-[#F28C28]">Maintenance mode is <strong>ON</strong>. Save to apply.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F28C28]/10 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#F28C28]" />
            </div>
            <div>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>Public website configuration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "public_prayer_wall",  label: "Public Prayer Wall",   desc: "Allow public viewing of prayer requests" },
            { key: "online_registrations", label: "Online Registrations", desc: "Enable online event and workshop registrations" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
              <Switch checked={settings[key as keyof typeof settings] === "true"}
                onCheckedChange={v => update(key, v ? "true" : "false")} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pt-2">
        <Button variant="outline" size="lg" onClick={() => { setSettings(DEFAULTS); setDirty(true); }}>Reset to Defaults</Button>
        <Button size="lg" className="bg-[#A92FFA] hover:bg-[#A92FFA]/90" onClick={save} disabled={saving || !dirty}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}
