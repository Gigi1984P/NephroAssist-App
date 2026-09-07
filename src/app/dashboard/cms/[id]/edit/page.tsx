"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/i18n-provider";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";

const TipTapEditor = dynamic(() => import("@/components/tiptap-editor").then(mod => ({ default: mod.TipTapEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-muted">Editor wird geladen...</div>,
});

export default function CmsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const [pageId, setPageId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setPageId(id);
      fetch(`/api/cms/pages?slug=`)
        .then((r) => r.json())
        .then((data) => {
          // We need to fetch by ID, but API only supports slug for now.
          // Let's fetch all and filter by id client-side for simplicity
          // since this is an admin-only view.
          if (data.pages) {
            const found = data.pages.find((p: any) => p.id === id);
            if (found) {
              setTitle(found.title);
              setSlug(found.slug);
              setContent(found.content || "<p></p>");
              setPublished(found.published);
            } else {
              setError(t("cms.notFound", "Seite nicht gefunden"));
            }
          }
          setLoading(false);
        })
        .catch(() => {
          setError(t("cms.loadError", "Fehler beim Laden"));
          setLoading(false);
        });
    });
  }, [params, t]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!pageId) return;
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/cms/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, content, published }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("cms.saveError", "Fehler beim Speichern"));
      } else {
        router.push("/dashboard/cms");
        router.refresh();
      }
    } catch {
      setError(t("cms.saveError", "Fehler beim Speichern"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("loading.title", "Laden...")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <PageHeader
        title={t("cms.editPage", "Seite bearbeiten")}
        description={t("cms.editDescription", "CMS-Seite bearbeiten")}
        action={
          <Link href="/dashboard/cms">
            <Button variant="outline" size="sm">
              <ArrowLeft size={16} className="me-2" />
              {t("cms.back", "Zurück")}
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSave} className="d-flex flex-column gap-4">
        {error && (
          <div className="alert alert-danger" role="alert">{error}</div>
        )}

        <div className="d-flex flex-column gap-2">
          <Label htmlFor="title">{t("cms.form.title", "Titel")} *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("cms.form.titlePlaceholder", "Seitentitel")}
            required
          />
        </div>

        <div className="d-flex flex-column gap-2">
          <Label htmlFor="slug">{t("cms.form.slug", "Slug")} *</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="seiten-slug"
            required
          />
        </div>

        <div className="d-flex align-items-center gap-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published" className="mb-0">
            {t("cms.form.published", "Veröffentlicht")}
          </Label>
        </div>

        <div className="d-flex flex-column gap-2">
          <Label htmlFor="content">{t("cms.form.content", "Inhalt")}</Label>
          <TipTapEditor
            content={content}
            onChange={setContent}
            placeholder={t("cms.form.contentPlaceholder", "Inhalt eingeben...")}
          />
        </div>

        <div className="d-flex gap-2">
          <Button type="submit" disabled={saving}>
            <Save size={16} className="me-2" />
            {saving ? t("cms.saving", "Speichern...") : t("cms.save", "Speichern")}
          </Button>
          <Link href="/dashboard/cms">
            <Button type="button" variant="outline">
              {t("common.cancel", "Abbrechen")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
