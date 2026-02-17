"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, Loader2 } from "lucide-react";

interface Settings {
  id: string;
  siteName: string;
  tagline: string | null;
  isPublic: boolean;
}

export function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
      setSiteName(data.siteName);
      setTagline(data.tagline || "");
      setIsPublic(data.isPublic);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName,
        tagline: tagline || null,
        isPublic,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full max-w-lg" />
      </div>
    );
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Configure your publication&apos;s basic settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short description of your site"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sitePublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <Label htmlFor="sitePublic">Site is public</Label>
        </div>
        <Button onClick={handleSave} disabled={saving || !siteName}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              Save Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
