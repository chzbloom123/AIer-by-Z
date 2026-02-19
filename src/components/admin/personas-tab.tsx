"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface Persona {
  id: string;
  name: string;
  bio: string;
  role: string;
  profileImageUrl: string | null;
  moreInfoText: string | null;
  externalLinks: string | null;
  displayOrder: number;
  isActive: boolean;
  _count?: { articles: number };
}

type PersonaForm = {
  name: string;
  bio: string;
  role: string;
  profileImageUrl: string;
  moreInfoText: string;
  displayOrder: number;
};

const emptyForm: PersonaForm = {
  name: "",
  bio: "",
  role: "reporter",
  profileImageUrl: "",
  moreInfoText: "",
  displayOrder: 0,
};

export function PersonasTab() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PersonaForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPersonas = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/personas");
    if (res.ok) setPersonas(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (p: Persona) => {
    setCreating(false);
    setEditingId(p.id);
    setForm({
      name: p.name,
      bio: p.bio,
      role: p.role,
      profileImageUrl: p.profileImageUrl || "",
      moreInfoText: p.moreInfoText || "",
      displayOrder: p.displayOrder,
    });
  };

  const cancel = () => {
    setCreating(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    if (creating) {
      await fetch("/api/admin/personas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (editingId) {
      await fetch(`/api/admin/persona/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    cancel();
    fetchPersonas();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this persona?")) return;
    await fetch(`/api/admin/persona/${id}`, { method: "DELETE" });
    fetchPersonas();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Personas ({personas.length})</h2>
        <Button size="sm" onClick={startCreate} disabled={creating}>
          <Plus className="h-4 w-4 mr-1" />
          Add Persona
        </Button>
      </div>

      {(creating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{creating ? "New Persona" : "Edit Persona"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="reporter">Reporter</option>
                  <option value="commentator">Commentator</option>
                  <option value="contributor">Contributor</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input
                id="profileImageUrl"
                value={form.profileImageUrl}
                onChange={(e) =>
                  setForm({ ...form, profileImageUrl: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.name || !form.bio}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" onClick={cancel}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {personas.map((p) => (
          <Card key={p.id} className={!p.isActive ? "opacity-50" : ""}>
            <CardContent className="flex items-start justify-between p-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge variant="secondary">{p.role}</Badge>
                  {!p.isActive && <Badge variant="destructive">Inactive</Badge>}
                  {p._count && (
                    <span className="text-xs text-muted-foreground">
                      {p._count.articles} article{p._count.articles !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.bio}
                </p>
              </div>
              <div className="flex gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(p)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {personas.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No personas yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
