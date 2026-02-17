"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";

interface Article {
  id: string;
  title: string;
  body: string;
  excerpt: string;
  featuredImageUrl: string | null;
  personaId: string;
  personaName: string;
  category: string | null;
  tags: string | null;
  style: string | null;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string;
  persona?: { name: string; role: string };
}

interface Persona {
  id: string;
  name: string;
  role: string;
}

type ArticleForm = {
  title: string;
  body: string;
  excerpt: string;
  personaId: string;
  category: string;
  style: string;
  isPublic: boolean;
};

const emptyForm: ArticleForm = {
  title: "",
  body: "",
  excerpt: "",
  personaId: "",
  category: "",
  style: "analysis",
  isPublic: true,
};

export function ArticlesTab() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [articlesRes, personasRes] = await Promise.all([
      fetch("/api/admin/articles"),
      fetch("/api/admin/personas"),
    ]);
    if (articlesRes.ok) setArticles(await articlesRes.json());
    if (personasRes.ok) setPersonas(await personasRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startCreate = () => {
    setCreating(true);
    setEditingId(null);
    setForm({ ...emptyForm, personaId: personas[0]?.id || "" });
  };

  const startEdit = (a: Article) => {
    setCreating(false);
    setEditingId(a.id);
    setForm({
      title: a.title,
      body: a.body,
      excerpt: a.excerpt,
      personaId: a.personaId,
      category: a.category || "",
      style: a.style || "analysis",
      isPublic: a.isPublic,
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
      await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else if (editingId) {
      await fetch(`/api/admin/article/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    cancel();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    await fetch(`/api/admin/article/${id}`, { method: "DELETE" });
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Articles ({articles.length})</h2>
        <Button size="sm" onClick={startCreate} disabled={creating || personas.length === 0}>
          <Plus className="h-4 w-4 mr-1" />
          New Article
        </Button>
      </div>

      {personas.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Create a persona first before writing articles.
        </p>
      )}

      {(creating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{creating ? "New Article" : "Edit Article"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personaId">Author</Label>
                <select
                  id="personaId"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.personaId}
                  onChange={(e) =>
                    setForm({ ...form, personaId: e.target.value })
                  }
                >
                  {personas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="e.g. technology"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <select
                  id="style"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.style}
                  onChange={(e) => setForm({ ...form, style: e.target.value })}
                >
                  <option value="analysis">Analysis</option>
                  <option value="commentary">Commentary</option>
                  <option value="satire">Satire</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <textarea
                id="body"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Auto-generated from body if left empty"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={form.isPublic}
                onChange={(e) =>
                  setForm({ ...form, isPublic: e.target.checked })
                }
              />
              <Label htmlFor="isPublic">Public</Label>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || !form.title || !form.body || !form.personaId}
              >
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
        {articles.map((a) => (
          <Card key={a.id}>
            <CardContent className="flex items-start justify-between p-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{a.title}</span>
                  {a.style && <Badge variant="secondary">{a.style}</Badge>}
                  {a.category && (
                    <Badge variant="outline">{a.category}</Badge>
                  )}
                  {!a.isPublic && <Badge variant="destructive">Draft</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  By {a.persona?.name || a.personaName}
                  {a.publishedAt &&
                    ` \u00b7 ${new Date(a.publishedAt).toLocaleDateString()}`}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {a.excerpt}
                </p>
              </div>
              <div className="flex gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(a)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {articles.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No articles yet. Create one to get started.
          </p>
        )}
      </div>
    </div>
  );
}
